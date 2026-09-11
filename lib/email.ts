import nodemailer from "nodemailer";
import { db } from "@/lib/db";

/**
 * Email transport.
 *
 * - EMAIL_PROVIDER=ses: Amazon SES through its SMTP interface
 *   (email-smtp.<SES_REGION>.amazonaws.com) with SES SMTP credentials. When
 *   SES_CONFIGURATION_SET is set, each message is tagged with it so delivery,
 *   bounce and complaint events reach /api/webhooks/ses via SNS.
 * - Otherwise generic SMTP from SMTP_* (production), or console logging in
 *   development, so auth flows still work without a provider account.
 *
 * Recipients on the suppression list (hard bounce, complaint, unsubscribe)
 * are never sent to; consent and suppression stay inside Amplivanta.
 */

const FROM = process.env.EMAIL_FROM || "Amplivanta <no-reply@amplivanta.com>";

type Transport = { transporter: nodemailer.Transporter; provider: "ses" | "smtp" };

let cached: Transport | null | undefined;
function getTransport(): Transport | null {
  if (cached !== undefined) return cached;
  const e = process.env;
  if (e.EMAIL_PROVIDER === "ses" && e.SES_REGION && e.SES_SMTP_USER && e.SES_SMTP_PASS) {
    cached = {
      provider: "ses",
      transporter: nodemailer.createTransport({
        host: `email-smtp.${e.SES_REGION}.amazonaws.com`,
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user: e.SES_SMTP_USER, pass: e.SES_SMTP_PASS },
      }),
    };
  } else if (e.SMTP_HOST) {
    cached = {
      provider: "smtp",
      transporter: nodemailer.createTransport({
        host: e.SMTP_HOST,
        port: Number(e.SMTP_PORT || 587),
        secure: e.SMTP_SECURE === "true",
        auth: e.SMTP_USER ? { user: e.SMTP_USER, pass: e.SMTP_PASS } : undefined,
      }),
    };
  } else {
    cached = null;
  }
  return cached;
}

export function emailProvider(): "ses" | "smtp" | null {
  return getTransport()?.provider ?? null;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Marketing mail is also held back by unsubscribes; transactional is not. */
  category?: "transactional" | "marketing";
}

export type SendResult = { sent: true } | { sent: false; reason: "suppressed" | "not_configured" };

/** Suppression reasons that block every kind of mail. */
const HARD_SUPPRESSIONS = ["bounce", "complaint"];

async function isSuppressed(to: string, category: EmailMessage["category"]): Promise<boolean> {
  try {
    const reasons = category === "marketing" ? [...HARD_SUPPRESSIONS, "unsubscribe"] : HARD_SUPPRESSIONS;
    const hit = await db.suppressionEntry.findFirst({
      where: { email: to.toLowerCase(), reason: { in: reasons } },
      select: { id: true },
    });
    return Boolean(hit);
  } catch {
    // An unreachable database must not block password resets.
    return false;
  }
}

export async function sendEmail(msg: EmailMessage): Promise<SendResult> {
  if (await isSuppressed(msg.to, msg.category)) return { sent: false, reason: "suppressed" };

  const transport = getTransport();
  if (!transport) {
    // Dev fallback — no provider configured.
    console.log("\n📧 [email:dev] would send:");
    console.log(`   to:      ${msg.to}`);
    console.log(`   subject: ${msg.subject}`);
    console.log(`   text:    ${msg.text ?? stripHtml(msg.html)}\n`);
    return { sent: false, reason: "not_configured" };
  }

  const headers: Record<string, string> = {};
  if (transport.provider === "ses" && process.env.SES_CONFIGURATION_SET) {
    headers["X-SES-CONFIGURATION-SET"] = process.env.SES_CONFIGURATION_SET;
  }
  await transport.transporter.sendMail({
    from: FROM,
    to: msg.to,
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
    headers,
  });
  return { sent: true };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Minimal branded wrapper for transactional emails. */
export function renderEmail(title: string, body: string, cta?: { label: string; url: string }): string {
  return `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px">
    <div style="font-size:20px;font-weight:800;color:#14121f;margin-bottom:16px">Amplivanta</div>
    <h1 style="font-size:20px;color:#14121f;margin:0 0 12px">${title}</h1>
    <p style="font-size:14px;line-height:1.6;color:#4a4756;margin:0 0 20px">${body}</p>
    ${
      cta
        ? `<a href="${cta.url}" style="display:inline-block;background:#6D3BF5;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:10px">${cta.label}</a>`
        : ""
    }
    <p style="font-size:11px;color:#767287;margin-top:28px">Amplivanta — We Engineer Growth</p>
  </div>`;
}
