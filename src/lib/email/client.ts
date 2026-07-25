import "server-only";
import { Resend } from "resend";

let resend: Resend | undefined;

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Resend is not configured. Add RESEND_API_KEY to your environment.",
    );
  }

  if (!resend) {
    resend = new Resend(apiKey);
  }

  return resend;
}

export function getEmailFrom(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    "Sungano Ubumbano <onboarding@resend.dev>"
  );
}

export function getAdminNotifyEmail(): string | null {
  return (
    process.env.EMAIL_ADMIN_TO?.trim() ||
    process.env.NEXT_PUBLIC_ADMIN_NOTIFY_EMAIL?.trim() ||
    "info@sungano-ubumbano.org"
  );
}
