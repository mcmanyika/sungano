export interface InboundAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface InboundEmail {
  id: string;
  from: string;
  to: string[];
  cc: string[];
  subject: string;
  text: string;
  html: string;
  messageId: string;
  attachments: InboundAttachment[];
  read: boolean;
  contentPending: boolean;
  receivedAt: Date | null;
}

export function formatInboundDate(date: Date | null): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Only messages addressed to this mailbox are shown in the admin inbox. */
export const INBOUND_INBOX_ADDRESS = "info@sungano-ubumbano.org";

function normalizeAddress(value: string): string {
  const match = value.match(/<([^>]+)>/);
  return (match ? match[1] : value).trim().toLowerCase();
}

export function isInboxRecipient(recipients: string[]): boolean {
  return recipients.some(
    (recipient) => normalizeAddress(recipient) === INBOUND_INBOX_ADDRESS,
  );
}

export function parseSenderDisplay(from: string): { name: string; email: string } {
  const match = from.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) {
    return {
      name: match[1].trim().replace(/^"|"$/g, "") || match[2],
      email: match[2].trim().toLowerCase(),
    };
  }

  return { name: from, email: from.trim().toLowerCase() };
}

function inboundPlainText(email: Pick<InboundEmail, "text" | "html">): string {
  if (email.text.trim()) {
    return email.text;
  }

  return email.html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|tr|div|h\d|li)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLabeledValue(text: string, label: string): string {
  const match = text.match(
    new RegExp(
      `${label}\\s*[:\\-]?\\s*([^\\n]+?)(?=\\s+(?:Name|Email|Phone|Province|Interest|Topic|Subject|Message)\\b|$)`,
      "i",
    ),
  );
  return match?.[1]?.trim() ?? "";
}

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Internal notices (new registration / contact) are sent from the org mailbox.
 * Replies should go to the person named in the notice, not back to info@.
 */
export function resolveInboxReplyRecipient(
  email: InboundEmail,
): { name: string; email: string } {
  const sender = parseSenderDisplay(email.from);
  const source = inboundPlainText(email);
  const labeledName = extractLabeledValue(source, "Name");
  const labeledEmail = extractLabeledValue(source, "Email").replace(/[<>]/g, "");
  const subjectName =
    email.subject.match(
      /^(?:New registration|New contact message):\s*(.+)$/i,
    )?.[1]?.trim() ?? "";
  const isInternalMailbox =
    sender.email === INBOUND_INBOX_ADDRESS ||
    sender.email.endsWith("@sungano-ubumbano.org");

  if (isInternalMailbox && looksLikeEmail(labeledEmail)) {
    return {
      name: labeledName || subjectName || labeledEmail,
      email: labeledEmail.toLowerCase(),
    };
  }

  return sender;
}
