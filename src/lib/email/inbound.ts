import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getResend } from "@/lib/email/client";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { isInboxRecipient } from "@/types/inbound-email";

interface InboundMeta {
  emailId: string;
  from?: string;
  to?: string[];
  cc?: string[];
  subject?: string;
  messageId?: string;
  createdAt?: string;
  attachments?: Array<{
    id?: string;
    filename?: string | null;
    content_type?: string;
    size?: number;
  }>;
}

export async function upsertInboundEmailFromMeta(meta: InboundMeta) {
  const db = getAdminFirestore();
  const receivedAt = meta.createdAt
    ? Timestamp.fromDate(new Date(meta.createdAt))
    : FieldValue.serverTimestamp();

  await db
    .collection("inboundEmails")
    .doc(meta.emailId)
    .set(
      {
        from: meta.from ?? "",
        to: meta.to ?? [],
        cc: meta.cc ?? [],
        subject: meta.subject ?? "(no subject)",
        messageId: meta.messageId ?? "",
        attachments: (meta.attachments ?? []).map((attachment) => ({
          id: attachment.id ?? "",
          filename: attachment.filename ?? "attachment",
          contentType: attachment.content_type ?? "application/octet-stream",
          size: attachment.size ?? 0,
        })),
        read: false,
        contentPending: true,
        receivedAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

export async function hydrateInboundEmail(emailId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const resend = getResend();
  const { data: email, error } = await resend.emails.receiving.get(emailId);

  if (error || !email) {
    return {
      ok: false,
      error: error?.message ?? "Could not fetch email content.",
    };
  }

  const receivedAt = email.created_at
    ? Timestamp.fromDate(new Date(email.created_at))
    : FieldValue.serverTimestamp();

  await getAdminFirestore()
    .collection("inboundEmails")
    .doc(email.id)
    .set(
      {
        from: email.from ?? "",
        to: email.to ?? [],
        cc: email.cc ?? [],
        subject: email.subject ?? "(no subject)",
        text: email.text ?? "",
        html: email.html ?? "",
        messageId: email.message_id ?? "",
        attachments: (email.attachments ?? []).map((attachment) => ({
          id: attachment.id,
          filename: attachment.filename ?? "attachment",
          contentType: attachment.content_type,
          size: attachment.size ?? 0,
        })),
        contentPending: false,
        receivedAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  return { ok: true };
}

export async function syncInboundEmailsFromResend(limit = 50): Promise<{
  synced: number;
  failed: number;
  error?: string;
}> {
  const resend = getResend();
  const { data, error } = await resend.emails.receiving.list({ limit });

  if (error || !data) {
    return {
      synced: 0,
      failed: 0,
      error: error?.message ?? "Could not list received emails.",
    };
  }

  let synced = 0;
  let failed = 0;

  for (const item of data.data) {
    // Only sync mail addressed to the public inbox address.
    if (!isInboxRecipient([...(item.to ?? []), ...(item.cc ?? [])])) {
      continue;
    }

    const hydrated = await hydrateInboundEmail(item.id);
    if (hydrated.ok) {
      synced += 1;
    } else {
      failed += 1;
      await upsertInboundEmailFromMeta({
        emailId: item.id,
        from: item.from,
        to: item.to,
        cc: item.cc ?? [],
        subject: item.subject,
        messageId: item.message_id,
        createdAt: item.created_at,
        attachments: item.attachments,
      }).catch(() => {
        // Ignore secondary write failures; count already in failed.
      });
    }
  }

  return { synced, failed };
}
