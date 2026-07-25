export const CONTACT_TOPICS = [
  "General enquiry",
  "Media enquiry",
  "Partnership",
  "Events",
  "Donations",
  "Technical support",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];
export type ContactStatus = "new" | "resolved";

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  topic: ContactTopic;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: Date | null;
}

export interface ContactMessageInput {
  fullName: string;
  email: string;
  phone: string;
  topic: ContactTopic | "";
  subject: string;
  message: string;
}

export function formatContactDate(date: Date | null): string {
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
