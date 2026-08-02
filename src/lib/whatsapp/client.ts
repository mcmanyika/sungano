import "server-only";
import {
  getTwilioAccountSid,
  getTwilioAuthToken,
  getTwilioWhatsAppFrom,
  isWhatsAppConfigured,
  toTwilioWhatsAppAddress,
} from "@/lib/whatsapp/config";

export async function sendWhatsAppText(
  to: string,
  body: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isWhatsAppConfigured()) {
    return { ok: false, error: "WhatsApp is not configured." };
  }

  const accountSid = getTwilioAccountSid();
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const auth = Buffer.from(
    `${accountSid}:${getTwilioAuthToken()}`,
  ).toString("base64");

  const params = new URLSearchParams({
    From: toTwilioWhatsAppAddress(getTwilioWhatsAppFrom()),
    To: toTwilioWhatsAppAddress(to),
    Body: body.slice(0, 1600),
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("Twilio WhatsApp send failed", response.status, detail);
      return { ok: false, error: "Failed to send WhatsApp message." };
    }

    return { ok: true };
  } catch (error) {
    console.error("Twilio WhatsApp send error", error);
    return { ok: false, error: "Failed to send WhatsApp message." };
  }
}
