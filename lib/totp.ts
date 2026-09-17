import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * RFC 6238 time-based one-time passwords (SHA-1, 6 digits, 30-second step) and
 * RFC 4648 base32, so two-factor enrolment needs no extra dependency.
 */

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export const TOTP_STEP_SECONDS = 30;
/** Codes from the previous, current and next step are accepted (clock drift). */
export const TOTP_WINDOW = 1;

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error("Invalid base32 character");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** A fresh 20-byte secret, base32 encoded for authenticator apps. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function totpCode(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  buf.writeUInt32BE(counter % 2 ** 32, 4);
  const digest = createHmac("sha1", key).update(buf).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = ((digest[offset] & 0x7f) << 24) | (digest[offset + 1] << 16) | (digest[offset + 2] << 8) | digest[offset + 3];
  return String(binary % 1_000_000).padStart(6, "0");
}

/** True when the code matches the secret within the drift window. */
export function verifyTotp(secret: string, code: string, at: number = Date.now()): boolean {
  const cleaned = (code ?? "").replace(/\D/g, "");
  if (cleaned.length !== 6) return false;
  const counter = Math.floor(at / 1000 / TOTP_STEP_SECONDS);
  for (let drift = -TOTP_WINDOW; drift <= TOTP_WINDOW; drift++) {
    let expected: string;
    try {
      expected = totpCode(secret, counter + drift);
    } catch {
      return false;
    }
    const a = Buffer.from(expected);
    const b = Buffer.from(cleaned);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

/** otpauth:// URI for authenticator apps and QR codes. */
export function otpauthUri(secret: string, account: string, issuer = "Amplivanta"): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({ secret, issuer, algorithm: "SHA1", digits: "6", period: String(TOTP_STEP_SECONDS) });
  return `otpauth://totp/${label}?${params}`;
}

/** Ten formatted recovery codes; store only their hashes. */
export function generateRecoveryCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const raw = base32Encode(randomBytes(10)).slice(0, 10).toLowerCase();
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}
