import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { allowedTopic, isTrustedAwsUrl, verifySnsMessage, type SnsMessage } from "@/lib/sns";

/**
 * POST /api/webhooks/ses — Amazon SES events delivered by SNS.
 *
 * Only signed messages from an allow-listed topic (SES_SNS_TOPIC_ARNS) are
 * accepted. Permanent bounces and complaints add the address to the
 * suppression list, which sendEmail() honours; transient bounces do not.
 */
export async function POST(req: Request) {
  let msg: SnsMessage;
  try {
    msg = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ error: "Malformed body" }, { status: 400 });
  }

  if (!msg?.TopicArn || !allowedTopic(msg.TopicArn)) {
    return NextResponse.json({ error: "Topic not allowed" }, { status: 403 });
  }
  if (!(await verifySnsMessage(msg))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (msg.Type === "SubscriptionConfirmation") {
    const sns = /^sns\.[a-z0-9-]+\.amazonaws\.com(\.cn)?$/;
    if (!msg.SubscribeURL || !isTrustedAwsUrl(msg.SubscribeURL, sns)) {
      return NextResponse.json({ error: "Untrusted subscribe URL" }, { status: 400 });
    }
    const res = await fetch(msg.SubscribeURL, { signal: AbortSignal.timeout(8000) });
    return NextResponse.json({ confirmed: res.ok }, { status: res.ok ? 200 : 502 });
  }
  if (msg.Type !== "Notification") return NextResponse.json({ ok: true });

  // Replay protection.
  try {
    await db.providerEvent.create({ data: { provider: "ses", eventId: msg.MessageId, type: "notification" } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ error: "Database unreachable" }, { status: 503 });
  }

  let event: {
    notificationType?: string;
    eventType?: string;
    bounce?: { bounceType?: string; bouncedRecipients?: { emailAddress: string }[] };
    complaint?: { complainedRecipients?: { emailAddress: string }[] };
  };
  try {
    event = JSON.parse(msg.Message);
  } catch {
    return NextResponse.json({ ok: true, ignored: "unparseable message" });
  }

  const kind = event.eventType ?? event.notificationType;
  const toSuppress: { email: string; reason: string }[] = [];
  if (kind === "Bounce" && event.bounce?.bounceType === "Permanent") {
    for (const r of event.bounce.bouncedRecipients ?? []) toSuppress.push({ email: r.emailAddress, reason: "bounce" });
  } else if (kind === "Complaint") {
    for (const r of event.complaint?.complainedRecipients ?? []) toSuppress.push({ email: r.emailAddress, reason: "complaint" });
  }

  for (const s of toSuppress) {
    await db.suppressionEntry.upsert({
      where: { email_reason: { email: s.email.toLowerCase(), reason: s.reason } },
      create: { email: s.email.toLowerCase(), reason: s.reason, source: "ses" },
      update: {},
    });
  }
  await db.providerEvent.update({
    where: { provider_eventId: { provider: "ses", eventId: msg.MessageId } },
    data: { processedAt: new Date(), type: kind ?? "unknown" },
  });
  return NextResponse.json({ ok: true, suppressed: toSuppress.length });
}
