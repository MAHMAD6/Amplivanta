import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validations/contact";
import { requireAdmin } from "@/lib/auth-helpers";
import { TURNSTILE_FIELD, requestIp, verifyTurnstile } from "@/lib/turnstile";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const check = await verifyTurnstile(body?.[TURNSTILE_FIELD], requestIp(req));
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { company, ...rest } = parsed.data;
    const contact = await db.contact.create({
      data: {
        ...rest,
        companyName: company,
      },
    });
    console.log(`📧 New contact submission from ${contact.email}`);
    return NextResponse.json({ success: true, id: contact.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const messages = await db.contact.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(messages);
}
