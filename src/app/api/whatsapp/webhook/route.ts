import { NextResponse } from "next/server";
import {
  getTwilioAuthToken,
  getTwilioWebhookUrl,
  isWhatsAppConfigured,
} from "@/lib/whatsapp/config";
import { handleWhatsAppVolunteerMessage } from "@/lib/whatsapp/flow";
import {
  extractTwilioIncomingMessage,
  parseTwilioFormParams,
  verifyTwilioSignature,
} from "@/lib/whatsapp/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: "twilio",
    configured: isWhatsAppConfigured(),
  });
}

export async function POST(request: Request) {
  if (!isWhatsAppConfigured()) {
    return NextResponse.json(
      { error: "WhatsApp is not configured." },
      { status: 503 },
    );
  }

  const params = await parseTwilioFormParams(request);
  const signature = request.headers.get("x-twilio-signature");
  const webhookUrl = getTwilioWebhookUrl(request.url);

  if (
    !verifyTwilioSignature(
      getTwilioAuthToken(),
      signature,
      webhookUrl,
      params,
    )
  ) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const message = extractTwilioIncomingMessage(params);

  if (message) {
    try {
      await handleWhatsAppVolunteerMessage(
        message.from,
        message.text,
        message.messageId,
      );
    } catch (error) {
      console.error("WhatsApp volunteer handler failed", error);
    }
  }

  // Empty TwiML — replies are sent via the REST API in the flow handler.
  return new NextResponse("<Response></Response>", {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
