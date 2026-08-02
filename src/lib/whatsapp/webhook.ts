import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  getTwilioAuthToken,
  normalizeWhatsAppAddress,
} from "@/lib/whatsapp/config";

export interface IncomingTextMessage {
  from: string;
  text: string;
  messageId: string;
}

export function verifyTwilioSignature(
  authToken: string,
  signatureHeader: string | null,
  url: string,
  params: Record<string, string>,
): boolean {
  if (!authToken) {
    return false;
  }

  // Dev convenience: skip when explicitly allowed and no signature present.
  if (!signatureHeader && process.env.TWILIO_SKIP_SIGNATURE_CHECK === "true") {
    return true;
  }

  if (!signatureHeader) {
    return false;
  }

  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + params[key];
  }

  const expected = createHmac("sha1", authToken)
    .update(Buffer.from(data, "utf8"))
    .digest("base64");

  try {
    const expectedBuf = Buffer.from(expected, "utf8");
    const providedBuf = Buffer.from(signatureHeader, "utf8");

    if (expectedBuf.length !== providedBuf.length) {
      return false;
    }

    return timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}

export function extractTwilioIncomingMessage(
  params: Record<string, string>,
): IncomingTextMessage | null {
  const fromRaw = params.From?.trim() ?? "";
  const body = params.Body?.trim() ?? "";
  const messageId = params.MessageSid?.trim() ?? "";

  if (!fromRaw || !body) {
    return null;
  }

  // Ignore status callbacks and empty SMS-style posts without a WhatsApp sender.
  if (!fromRaw.toLowerCase().startsWith("whatsapp:")) {
    return null;
  }

  return {
    from: normalizeWhatsAppAddress(fromRaw),
    text: body,
    messageId,
  };
}

export async function parseTwilioFormParams(
  request: Request,
): Promise<Record<string, string>> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const raw = await request.text();
    const search = new URLSearchParams(raw);
    const params: Record<string, string> = {};
    for (const [key, value] of search.entries()) {
      params[key] = value;
    }
    return params;
  }

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const params: Record<string, string> = {};
    for (const [key, value] of form.entries()) {
      if (typeof value === "string") {
        params[key] = value;
      }
    }
    return params;
  }

  // Fallback: try urlencoded parse of the raw body.
  const raw = await request.text();
  const search = new URLSearchParams(raw);
  const params: Record<string, string> = {};
  for (const [key, value] of search.entries()) {
    params[key] = value;
  }
  return params;
}

