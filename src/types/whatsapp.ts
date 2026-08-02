export type WhatsAppVolunteerStep =
  | "idle"
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

export interface WhatsAppVolunteerSession {
  waId: string;
  step: WhatsAppVolunteerStep;
  draft: WhatsAppVolunteerDraft;
  updatedAt: Date | null;
}

export type VolunteerSource = "web" | "whatsapp";
