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
