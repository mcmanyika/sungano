import { getClientAuth } from "@/lib/firebase/client";

export interface EmailReplyDraftRequest {
  recipientName: string;
  subject: string;
  originalText?: string;
  originalHtml?: string;
}

export type EmailReplyDraftResult =
  | { ok: true; subject: string; body: string }
  | { ok: false; error: string };

export async function requestEmailReplyDraft(
  input: EmailReplyDraftRequest,
): Promise<EmailReplyDraftResult> {
  const user = getClientAuth().currentUser;

  if (!user) {
    return { ok: false, error: "You must be signed in as an admin." };
  }

  const response = await fetch("/api/email/reply/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await user.getIdToken()}`,
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json().catch(() => ({}))) as {
    subject?: string;
    body?: string;
    error?: string;
  };

  if (!response.ok || !data.body?.trim()) {
    return {
      ok: false,
      error: data.error ?? "Could not generate a reply.",
    };
  }

  return {
    ok: true,
    subject: data.subject?.trim() || input.subject,
    body: data.body.trim(),
  };
}
