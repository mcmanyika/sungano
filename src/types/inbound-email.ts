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
