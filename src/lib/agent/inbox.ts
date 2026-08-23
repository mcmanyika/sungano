import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { isOpenAIConfigured } from "@/lib/openai/config";
import { generateEmailReplyDraft } from "@/lib/openai/email-reply";
import { resolveInboxReplyRecipient } from "@/types/inbound-email";
import type { AgentStatus, InboxAgentChannel } from "@/types/agent";
import type { InboundEmail } from "@/types/inbound-email";

export interface InboxAgentDraft {
  subject: string;
  body: string;
}

function agentFields(
  status: AgentStatus,
  draft?: InboxAgentDraft,
  error?: string,
) {
  return {
    agentStatus: status,
    agentDraftSubject: draft?.subject ?? "",
    agentDraftBody: draft?.body ?? "",
    agentError: error ?? "",
    agentUpdatedAt: FieldValue.serverTimestamp(),
  };
}

function mapInboundForRecipient(
  id: string,
  data: Record<string, unknown>,
): InboundEmail {
  return {
    id,
    from: String(data.from ?? ""),
    to: Array.isArray(data.to) ? data.to.map(String) : [],
    cc: Array.isArray(data.cc) ? data.cc.map(String) : [],
    subject: String(data.subject ?? "(no subject)"),
    text: String(data.text ?? ""),
    html: String(data.html ?? ""),
    messageId: String(data.messageId ?? ""),
    attachments: [],
    read: Boolean(data.read),
    contentPending: Boolean(data.contentPending),
    receivedAt: null,
  };
}

export async function draftInboundEmailReply(
  emailId: string,
  options?: { force?: boolean },
): Promise<InboxAgentDraft | null> {
  if (!isOpenAIConfigured()) {
    return null;
  }

  const ref = getAdminFirestore().collection("inboundEmails").doc(emailId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data() ?? {};

  if (!options?.force && data.agentStatus === "drafted" && data.agentDraftBody) {
    return {
      subject: String(data.agentDraftSubject ?? ""),
      body: String(data.agentDraftBody ?? ""),
    };
  }

  if (data.contentPending) {
    await ref.set(agentFields("queued"), { merge: true });
    return null;
  }

  const email = mapInboundForRecipient(emailId, data as Record<string, unknown>);
  const recipient = resolveInboxReplyRecipient(email);

  await ref.set(agentFields("queued"), { merge: true });

  const draft = await generateEmailReplyDraft({
    channel: "email",
    recipientName: recipient.name,
    subject: email.subject,
    originalText: email.text,
    originalHtml: email.html,
  });

  if (!draft) {
    await ref.set(agentFields("failed", undefined, "Could not generate a reply."), {
      merge: true,
    });
    return null;
  }

  await ref.set(agentFields("drafted", draft), { merge: true });
  return draft;
}

export async function draftCommentReply(
  commentId: string,
  options?: { force?: boolean },
): Promise<InboxAgentDraft | null> {
  if (!isOpenAIConfigured()) {
    return null;
  }

  const ref = getAdminFirestore().collection("comments").doc(commentId);
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data() ?? {};

  if (!options?.force && data.agentStatus === "drafted" && data.agentDraftBody) {
    return {
      subject: String(data.agentDraftSubject ?? ""),
      body: String(data.agentDraftBody ?? ""),
    };
  }

  const authorName = String(data.authorName ?? "").trim();
  const articleTitle = String(data.articleTitle ?? "an article").trim();
  const body = String(data.body ?? "").trim();
  const subject = `Re: Your comment on ${articleTitle}`;

  await ref.set(agentFields("queued"), { merge: true });

  const draft = await generateEmailReplyDraft({
    channel: "comment",
    recipientName: authorName,
    subject,
    originalText: [
      "Website article comment",
      `Article: ${articleTitle}`,
      `Name: ${authorName}`,
      `Email: ${String(data.email ?? "")}`,
      `Comment: ${body}`,
    ].join("\n"),
  });

  if (!draft) {
    await ref.set(agentFields("failed", undefined, "Could not generate a reply."), {
      merge: true,
    });
    return null;
  }

  await ref.set(agentFields("drafted", draft), { merge: true });
  return draft;
}

export async function runInboxAgent(
  channel: InboxAgentChannel,
  id: string,
  options?: { force?: boolean },
): Promise<InboxAgentDraft | null> {
  if (channel === "comment") {
    return draftCommentReply(id, options);
  }

  return draftInboundEmailReply(id, options);
}
