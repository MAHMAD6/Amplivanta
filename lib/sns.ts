import { createVerify, X509Certificate } from "node:crypto";

/**
 * Amazon SNS message signature verification, used for SES event delivery.
 * Follows AWS's documented scheme: fetch the signing certificate (only from
 * an sns.<region>.amazonaws.com HTTPS URL), rebuild the canonical string for
 * the message type, and verify SignatureVersion 1 (SHA1) or 2 (SHA256).
 */

export type SnsMessage = {
  Type: "Notification" | "SubscriptionConfirmation" | "UnsubscribeConfirmation";
  MessageId: string;
  TopicArn: string;
  Message: string;
  Timestamp: string;
  Signature: string;
  SignatureVersion: "1" | "2";
  SigningCertURL: string;
  Subject?: string;
  SubscribeURL?: string;
  Token?: string;
};

const CERT_HOST = /^sns\.[a-z0-9-]+\.amazonaws\.com(\.cn)?$/;

export function isTrustedAwsUrl(raw: string, hostPattern = CERT_HOST): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && hostPattern.test(u.hostname);
  } catch {
    return false;
  }
}

/** The exact string AWS signs, per message type. */
export function canonicalString(m: SnsMessage): string {
  const keys =
    m.Type === "Notification"
      ? ["Message", "MessageId", ...(m.Subject !== undefined ? ["Subject"] : []), "Timestamp", "TopicArn", "Type"]
      : ["Message", "MessageId", "SubscribeURL", "Timestamp", "Token", "TopicArn", "Type"];
  return keys.map((k) => `${k}\n${(m as Record<string, unknown>)[k] ?? ""}\n`).join("");
}

const certCache = new Map<string, string>();

async function fetchCert(url: string): Promise<string> {
  const hit = certCache.get(url);
  if (hit) return hit;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`Certificate fetch failed: ${res.status}`);
  const pem = await res.text();
  new X509Certificate(pem); // throws on anything that is not a certificate
  certCache.set(url, pem);
  return pem;
}

export async function verifySnsMessage(m: SnsMessage): Promise<boolean> {
  if (!m?.Signature || !m.SigningCertURL || !isTrustedAwsUrl(m.SigningCertURL)) return false;
  const algo = m.SignatureVersion === "2" ? "RSA-SHA256" : m.SignatureVersion === "1" ? "RSA-SHA1" : null;
  if (!algo) return false;
  try {
    const pem = await fetchCert(m.SigningCertURL);
    const v = createVerify(algo);
    v.update(canonicalString(m), "utf8");
    return v.verify(pem, m.Signature, "base64");
  } catch {
    return false;
  }
}

/** Topic ARNs allowed to post here; empty means none are trusted yet. */
export function allowedTopic(arn: string): boolean {
  const list = (process.env.SES_SNS_TOPIC_ARNS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return list.includes(arn);
}
