export function isWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_WHATSAPP_FROM?.trim(),
  );
}

export function getTwilioAccountSid(): string {
  return process.env.TWILIO_ACCOUNT_SID?.trim() ?? "";
}

export function getTwilioAuthToken(): string {
  return process.env.TWILIO_AUTH_TOKEN?.trim() ?? "";
}

/** E.164 or `whatsapp:+E164` — normalised when sending. */
export function getTwilioWhatsAppFrom(): string {
  return process.env.TWILIO_WHATSAPP_FROM?.trim() ?? "";
}

/**
 * Public webhook URL Twilio signed against.
 * Prefer an explicit value so signature checks work behind proxies.
 */
export function getTwilioWebhookUrl(fallbackRequestUrl: string): string {
  const explicit = process.env.TWILIO_WEBHOOK_URL?.trim();
  if (explicit) {
    return explicit;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, "");
  if (siteUrl) {
    return `${siteUrl}/api/whatsapp/webhook`;
  }

  return fallbackRequestUrl;
}

/** Strip `whatsapp:` and ensure a leading +. */
export function normalizeWhatsAppAddress(value: string): string {
  let phone = value.trim();
  if (phone.toLowerCase().startsWith("whatsapp:")) {
    phone = phone.slice("whatsapp:".length).trim();
  }
  if (!phone.startsWith("+") && /^\d+$/.test(phone)) {
    phone = `+${phone}`;
  }
  return phone;
}

export function toTwilioWhatsAppAddress(value: string): string {
  const phone = normalizeWhatsAppAddress(value);
  return phone.toLowerCase().startsWith("whatsapp:")
    ? phone
    : `whatsapp:${phone}`;
}
