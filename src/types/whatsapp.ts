export type WhatsAppVolunteerStep =
  | "idle"
  | "chat"
  | "name"
  | "email"
  | "phone"
  | "province"
  | "interest"
  | "message"
  | "confirm";

export interface WhatsAppVolunteerDraft {
  fullName?: string;
  email?: string;
  phone?: string;
  province?: string;
  interest?: string;
  message?: string;
}

export interface WhatsAppChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface WhatsAppVolunteerSession {
  waId: string;
  step: WhatsAppVolunteerStep;
  draft: WhatsAppVolunteerDraft;
  history: WhatsAppChatMessage[];
  updatedAt: Date | null;
}

export type VolunteerSource = "web" | "whatsapp";
