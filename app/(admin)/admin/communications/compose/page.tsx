import type { Metadata } from "next";
import { Role } from "@prisma/client";
import { SuperInfoNote } from "@/components/admin/primitives";
import { ComposeCommunication } from "@/components/admin/communications-panels";
import { AUDIENCE_SCOPES, COMMUNICATION_TYPES, communicationsReady } from "@/lib/server/communications";
import { loadCommunicationTemplates, loadCommunications } from "../loaders";

export const metadata: Metadata = { title: "Send Communication" };
export const dynamic = "force-dynamic";

export default async function SendCommunicationPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const [{ rows, workspaces, connected }, templates] = await Promise.all([loadCommunications(50), loadCommunicationTemplates()]);
  const draft = id ? rows.find((r) => r.id === id && ["DRAFT", "SCHEDULED"].includes(r.status)) ?? null : null;

  return (
    <div className="space-y-6">
      <ComposeCommunication
        types={COMMUNICATION_TYPES}
        scopes={AUDIENCE_SCOPES}
        templates={templates.rows}
        workspaces={workspaces}
        roles={Object.values(Role)}
        providerReady={communicationsReady()}
        connected={connected}
        draft={draft}
      />
      <SuperInfoNote title="About Send Communication">
        The recipient list is resolved and stored when you send, so the audience cannot change mid-delivery. Each recipient records its own outcome — sent, failed, suppressed or not sent — and nothing is reported as delivered or opened without provider events.
      </SuperInfoNote>
    </div>
  );
}
