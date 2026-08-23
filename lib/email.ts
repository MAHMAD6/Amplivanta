import nodemailer from "nodemailer";

/**
 * Email transport. Uses SMTP when SMTP_* env vars are set (production); otherwise
 * logs the message to the server console (development), so auth flows that send
 * verification / reset emails still work end-to-end without a provider account.
 */

const FROM = process.env.EMAIL_FROM || "Amplivanta <no-reply@amplivanta.com>";

let transporter: nodemailer.Transporter | null = null;
function getTransport(): nodemailer.Transporter | null {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(msg: EmailMessage): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    // Dev fallback — no SMTP configured.
    console.log("\n📧 [email:dev] would send:");
    console.log(`   to:      ${msg.to}`);
    console.log(`   subject: ${msg.subject}`);
    console.log(`   text:    ${msg.text ?? stripHtml(msg.html)}\n`);
    return;
  }
  await transport.sendMail({ from: FROM, to: msg.to, subject: msg.subject, html: msg.html, text: msg.text });
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
