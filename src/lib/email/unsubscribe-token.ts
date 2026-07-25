import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

function getUnsubscribeSecret(): string {
  const secret =
    process.env.UNSUBSCRIBE_SECRET?.trim() ||
    process.env.RESEND_API_KEY?.trim() ||
    process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim();

  if (!secret) {
    throw new Error(
      "Unsubscribe signing is not configured. Set UNSUBSCRIBE_SECRET.",
    );
  }

  return secret;
}

export function createUnsubscribeToken(email: string): string {
  const normalized = email.trim().toLowerCase();
  return createHmac("sha256", getUnsubscribeSecret())
    .update(normalized)
    .digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!email || !token || !/^[a-f0-9]{64}$/i.test(token)) {
    return false;
  }

  try {
    const expected = createUnsubscribeToken(email);
    const expectedBuffer = Buffer.from(expected, "utf8");
    const tokenBuffer = Buffer.from(token.trim().toLowerCase(), "utf8");

    if (expectedBuffer.length !== tokenBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, tokenBuffer);
  } catch {
    return false;
  }
}

export function buildUnsubscribeUrl(email: string, siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, "");
  const normalized = email.trim().toLowerCase();
  const token = createUnsubscribeToken(normalized);
  const params = new URLSearchParams({
    email: normalized,
    token,
  });

  return `${base}/unsubscribe?${params.toString()}`;
}
