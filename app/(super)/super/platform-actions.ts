"use server";

import { revalidatePath } from "next/cache";
import { ModuleStatus, Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MARKETPLACE_FLAG_REGISTRY, MARKETPLACE_MODULE } from "@/lib/marketplace/config";

export type ActionOk = { ok: true; message: string } | { ok: false; error: string };

async function requireSuperAdmin() {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string; role?: string } | undefined;
  if (!user || user.role !== "SUPER_ADMIN") return null;
  return user;
}

async function audit(
  actorUserId: string | null,
  action: string,
  resourceType: string,
  resourceId?: string,
  metadata?: Prisma.InputJsonValue,
  reason?: string,
) {
  try {
    await prisma.platformAuditLog.create({
      data: { actorUserId, action, resourceType, resourceId, metadata: metadata ?? {}, reason },
    });
  } catch {
    // Audit failure must not roll back an already-authorized change.
  }
}

/**
 * Registers every module and feature flag declared in code so operators can see
 * and control them. Idempotent, and never flips an existing switch — newly
 * registered entries start disabled so nothing turns itself on.
 */
export async function syncPlatformRegistry(): Promise<ActionOk> {
  const user = await requireSuperAdmin();
  if (!user) return { ok: false, error: "You are not authorized to register modules." };

  try {
    let modulesAdded = 0;
    let flagsAdded = 0;

    const existingModule = await prisma.moduleControl.findUnique({ where: { key: MARKETPLACE_MODULE.key } });
    if (!existingModule) {
      await prisma.moduleControl.create({
        data: {
          key: MARKETPLACE_MODULE.key,
          name: MARKETPLACE_MODULE.name,
          description: MARKETPLACE_MODULE.description,
          category: MARKETPLACE_MODULE.category,
          isCore: MARKETPLACE_MODULE.isCore,
          status: ModuleStatus.DISABLED,
          updatedByUserId: user.id ?? null,
        },
      });
      modulesAdded++;
    }

    for (const f of MARKETPLACE_FLAG_REGISTRY) {
      const exists = await prisma.featureFlag.findUnique({ where: { key: f.key } });
      if (!exists) {
        await prisma.featureFlag.create({
          data: { key: f.key, name: f.name, description: f.purpose, enabled: false },
        });
        flagsAdded++;
      }
    }

    await audit(user.id ?? null, "platform.registry_synced", "ModuleControl", undefined, {
      modulesAdded,
      flagsAdded,
    });
    revalidatePath("/super/system-management/module-controls");
    revalidatePath("/super/system-management/feature-flags");
    return {
      ok: true,
      message:
        modulesAdded + flagsAdded === 0
          ? "Everything declared in code is already registered."
          : `Registered ${modulesAdded} module(s) and ${flagsAdded} feature flag(s), all disabled.`,
    };
  } catch {
    return { ok: false, error: "Could not register modules — the platform database was unreachable." };
  }
}

/**
 * Enable or disable a module. Core modules (authentication, tenancy, security,
 * billing integrity, audit logging) have no casual off switch.
 */
export async function setModuleStatus(key: string, enabled: boolean, reason: string): Promise<ActionOk> {
  const user = await requireSuperAdmin();
  if (!user) return { ok: false, error: "You are not authorized to change module state." };
  if (!reason.trim()) return { ok: false, error: "A reason is required to change a module." };

  try {
    const mod = await prisma.moduleControl.findUnique({ where: { key } });
    if (!mod) return { ok: false, error: "That module is not registered." };
    if (mod.isCore && !enabled) {
      return { ok: false, error: `${mod.name} is a core module and cannot be switched off.` };
    }

    await prisma.moduleControl.update({
      where: { key },
      data: { status: enabled ? ModuleStatus.ENABLED : ModuleStatus.DISABLED, updatedByUserId: user.id ?? null },
    });
    await audit(
      user.id ?? null,
      enabled ? "module.enabled" : "module.disabled",
      "ModuleControl",
      mod.id,
      { key },
      reason,
    );

    revalidatePath("/super/system-management/module-controls");
    revalidatePath("/app/marketplace");
    return {
      ok: true,
      message: `${mod.name} ${enabled ? "enabled" : "disabled"}. Existing data is preserved either way.`,
    };
  } catch {
    return { ok: false, error: "Could not change the module — the platform database was unreachable." };
  }
}

export async function setFeatureFlag(key: string, enabled: boolean): Promise<ActionOk> {
  const user = await requireSuperAdmin();
  if (!user) return { ok: false, error: "You are not authorized to change feature flags." };

  try {
    const flag = await prisma.featureFlag.findUnique({ where: { key } });
    if (!flag) return { ok: false, error: "That feature flag is not registered." };

    await prisma.featureFlag.update({ where: { key }, data: { enabled } });
    await audit(user.id ?? null, enabled ? "feature_flag.enabled" : "feature_flag.disabled", "FeatureFlag", flag.id, { key });

    revalidatePath("/super/system-management/feature-flags");
    revalidatePath("/app/marketplace");
    return { ok: true, message: `${flag.name} ${enabled ? "enabled" : "disabled"}.` };
  } catch {
    return { ok: false, error: "Could not change the flag — the platform database was unreachable." };
  }
}

/** Rows for the module-controls and feature-flags admin screens. */
export async function loadPlatformControls() {
  try {
    const [modules, flags] = await Promise.all([
      prisma.moduleControl.findMany({ orderBy: { name: "asc" } }),
      prisma.featureFlag.findMany({ orderBy: { key: "asc" } }),
    ]);
    return {
      connected: true,
      modules: modules.map((m) => ({
        key: m.key,
        name: m.name,
        description: m.description,
        status: m.status,
        isCore: m.isCore,
        scope: m.scopeLevel,
      })),
      flags: flags.map((f) => ({ key: f.key, name: f.name, description: f.description, enabled: f.enabled })),
    };
  } catch {
    return { connected: false, modules: [], flags: [] };
  }
}
