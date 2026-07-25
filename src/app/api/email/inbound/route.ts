import { NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getResend, isEmailConfigured } from "@/lib/email/client";
import { getAdminFirestore } from "@/lib/firebase/admin";

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
  };

  const emailId = meta.email_id;

  if (!emailId) {
    return NextResponse.json({ error: "Missing email_id." }, { status: 400 });
  }

  try {
    const { data: email, error } = await resend.emails.receiving.get(emailId);

    if (error || !email) {
      console.error("Failed to fetch received email", error);
      return NextResponse.json(
        { error: "Could not fetch email content." },
        { status: 502 },
      );
    }

    const receivedAt = email.created_at
      ? Timestamp.fromDate(new Date(email.created_at))
      : FieldValue.serverTimestamp();

    await getAdminFirestore()
      .collection("inboundEmails")
      .doc(email.id)
      .set(
        {
          from: email.from ?? meta.from ?? "",
          to: email.to ?? meta.to ?? [],
          cc: email.cc ?? meta.cc ?? [],
          subject: email.subject ?? meta.subject ?? "(no subject)",
          text: email.text ?? "",
          html: email.html ?? "",
          messageId: email.message_id ?? meta.message_id ?? "",
          attachments: (email.attachments ?? []).map((attachment) => ({
            id: attachment.id,
            filename: attachment.filename ?? "attachment",
            contentType: attachment.content_type,
            size: attachment.size ?? 0,
          })),
          read: false,
          receivedAt,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

    return NextResponse.json({ received: true, id: email.id });
  } catch (error) {
    console.error("Inbound email handling failed", error);
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 },
    );
  }
}
