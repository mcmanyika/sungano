import { getClientAuth } from "@/lib/firebase/client";
import type { InboxAgentChannel } from "@/types/agent";
import type { EmailReplyDraftResult } from "@/lib/email/request-reply-draft";

export async function requestInboxAgentDraft(
  channel: InboxAgentChannel,
  id: string,
): Promise<EmailReplyDraftResult> {
  const user = getClientAuth().currentUser;

  if (!user) {
    return { ok: false, error: "You must be signed in as an admin." };
  }

  const response = await fetch("/api/agent/inbox", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await user.getIdToken()}`,
    },
    body: JSON.stringify({ channel, id }),
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
    subject: data.subject?.trim() || "",
    body: data.body.trim(),
  };
}
