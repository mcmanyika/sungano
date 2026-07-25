import { NextResponse } from "next/server";
import { getResend, isEmailConfigured } from "@/lib/email/client";
import {
  hydrateInboundEmail,
  upsertInboundEmailFromMeta,
} from "@/lib/email/inbound";
import { isInboxRecipient } from "@/types/inbound-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readHeader(request: Request, name: string): string {
  return request.headers.get(name) ?? request.headers.get(name.toLowerCase()) ?? "";
}

export async function POST(request: Request) {
  if (!isEmailConfigured() || !process.env.RESEND_WEBHOOK_SECRET?.trim()) {
    return NextResponse.json(
      { error: "Inbound email webhook is not configured." },
      { status: 503 },
    );
  }

  const payload = await request.text();
  const resend = getResend();

  let event: ReturnType<typeof resend.webhooks.verify>;

  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: readHeader(request, "svix-id"),
        timestamp: readHeader(request, "svix-timestamp"),
        signature: readHeader(request, "svix-signature"),
      },
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET.trim(),
    });
  } catch (error) {
    console.error("Resend inbound webhook verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const meta = event.data as {
    email_id?: string;
    from?: string;
    to?: string[];
    cc?: string[];
    subject?: string;
    message_id?: string;
    created_at?: string;
    attachments?: Array<{
      id?: string;
      filename?: string | null;
      content_type?: string;
      size?: number;
    }>;
  };

  const emailId = meta.email_id;

  if (!emailId) {
    return NextResponse.json({ error: "Missing email_id." }, { status: 400 });
  }

  // Only keep mail addressed to the public inbox address.
  if (!isInboxRecipient([...(meta.to ?? []), ...(meta.cc ?? [])])) {
    return NextResponse.json({ received: true, ignored: "recipient" });
  }

  try {
    // Always persist metadata first so the inbox updates even if the API key
    // cannot read full receiving content (send-only keys).
    await upsertInboundEmailFromMeta({
      emailId,
      from: meta.from,
      to: meta.to,
      cc: meta.cc,
      subject: meta.subject,
      messageId: meta.message_id,
      createdAt: meta.created_at,
      attachments: meta.attachments,
    });

    const hydrated = await hydrateInboundEmail(emailId);

    if (!hydrated.ok) {
      console.error("Failed to hydrate received email", hydrated.error);
      // Still 200 so Resend does not keep retrying forever for a key restriction.
      return NextResponse.json({
        received: true,
        id: emailId,
        contentPending: true,
        warning: hydrated.error,
      });
    }

    return NextResponse.json({ received: true, id: emailId });
  } catch (error) {
    console.error("Inbound email handling failed", error);
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 },
    );
  }
}
