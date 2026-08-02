import "server-only";
import { isEmailConfigured } from "@/lib/email/client";
import { sendVolunteerEmails } from "@/lib/email/send";
import { registerVolunteerAdmin } from "@/lib/firebase/volunteers-admin";
import { sendWhatsAppText } from "@/lib/whatsapp/client";
import {
  clearWhatsAppSession,
  claimWhatsAppMessageId,
  getWhatsAppSession,
  saveWhatsAppSession,
} from "@/lib/whatsapp/sessions";
import {
  VOLUNTEER_INTERESTS,
  VOLUNTEER_PROVINCES,
} from "@/types/volunteer";
import type {
  WhatsAppVolunteerDraft,
  WhatsAppVolunteerStep,
} from "@/types/whatsapp";

const START_KEYWORDS = new Set([
  "volunteer",
  "register",
  "start",
  "join",
]);

const CANCEL_KEYWORDS = new Set(["cancel", "stop", "quit", "exit"]);

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatPhoneDisplay(waId: string): string {
  return waId.startsWith("+") ? waId : `+${waId}`;
}

function numberedList(items: readonly string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function parseListChoice(
  text: string,
  items: readonly string[],
): string | null {
  const trimmed = text.trim();
  const asNumber = Number.parseInt(trimmed, 10);

  if (
    Number.isInteger(asNumber) &&
    asNumber >= 1 &&
    asNumber <= items.length
  ) {
    return items[asNumber - 1] ?? null;
  }

  const match = items.find(
    (item) => item.toLowerCase() === trimmed.toLowerCase(),
  );
  return match ?? null;
}

function welcomeMessage(): string {
  return [
    "Welcome to Sungano Ubumbano volunteer registration.",
    "",
    "Reply *VOLUNTEER* to begin.",
    "Reply *CANCEL* anytime to stop.",
  ].join("\n");
}

function promptName(): string {
  return "What is your full name?";
}

function promptEmail(): string {
  return "What is your email address?";
}

function promptPhone(waId: string): string {
  return [
    `We can use your WhatsApp number (${formatPhoneDisplay(waId)}) as your phone.`,
    "",
    "Reply *YES* to confirm, or send a different phone number.",
  ].join("\n");
}

function promptProvince(): string {
  return [
    "Which province are you in? Reply with a number or the province name:",
    "",
    numberedList(VOLUNTEER_PROVINCES),
  ].join("\n");
}

function promptInterest(): string {
  return [
    "What is your area of interest? Reply with a number or the name:",
    "",
    numberedList(VOLUNTEER_INTERESTS),
  ].join("\n");
}

function promptMessage(): string {
  return [
    "Optional: share a short message about how you’d like to help.",
    "Reply *SKIP* to continue without a message.",
  ].join("\n");
}

function promptConfirm(draft: WhatsAppVolunteerDraft): string {
  return [
    "Please confirm your registration:",
    "",
    `Name: ${draft.fullName ?? ""}`,
    `Email: ${draft.email ?? ""}`,
    `Phone: ${draft.phone ?? ""}`,
    `Province: ${draft.province ?? ""}`,
    `Interest: ${draft.interest ?? ""}`,
    `Message: ${draft.message?.trim() ? draft.message : "(none)"}`,
    "",
    "Reply *YES* to submit, or *CANCEL* to stop.",
  ].join("\n");
}

async function reply(waId: string, body: string): Promise<void> {
  await sendWhatsAppText(waId, body);
}

async function beginRegistration(waId: string): Promise<void> {
  await saveWhatsAppSession(waId, "name", {});
  await reply(
    waId,
    [
      "Great — let’s register you as a volunteer.",
      "",
      promptName(),
    ].join("\n"),
  );
}

async function completeRegistration(
  waId: string,
  draft: WhatsAppVolunteerDraft,
): Promise<void> {
  const input = {
    fullName: draft.fullName ?? "",
    email: draft.email ?? "",
    phone: draft.phone ?? "",
    province: draft.province ?? "",
    interest: draft.interest ?? "",
    message: draft.message ?? "",
  };

  const result = await registerVolunteerAdmin(input, "whatsapp");

  if (!result.ok) {
    await reply(
      waId,
      "Sorry — we couldn’t save your registration. Please try again later or register on the website.",
    );
    return;
  }

  await clearWhatsAppSession(waId);

  if (isEmailConfigured()) {
    void sendVolunteerEmails(input).catch((error) => {
      console.error("WhatsApp volunteer email failed", error);
    });
  }

  await reply(
    waId,
    [
      "Thank you — your volunteer registration was received.",
      "Our team will follow up with next steps.",
    ].join("\n"),
  );
}

export async function handleWhatsAppVolunteerMessage(
  waId: string,
  text: string,
  messageId?: string,
): Promise<void> {
  if (messageId) {
    const alreadyHandled = await claimWhatsAppMessageId(messageId);
    if (alreadyHandled) {
      return;
    }
  }

  const normalised = text.trim();
  const keyword = normalised.toLowerCase();

  if (!normalised) {
    return;
  }

  if (CANCEL_KEYWORDS.has(keyword)) {
    await clearWhatsAppSession(waId);
    await reply(waId, "Registration cancelled. Reply *VOLUNTEER* anytime to start again.");
    return;
  }

  const session = await getWhatsAppSession(waId);
  const step: WhatsAppVolunteerStep = session?.step ?? "idle";
  const draft: WhatsAppVolunteerDraft = { ...(session?.draft ?? {}) };

  if (step === "idle" || !session) {
    if (START_KEYWORDS.has(keyword)) {
      await beginRegistration(waId);
      return;
    }

    await reply(waId, welcomeMessage());
    return;
  }

  if (START_KEYWORDS.has(keyword)) {
    await beginRegistration(waId);
    return;
  }

  switch (step) {
    case "name": {
      if (normalised.length < 2 || normalised.length > 120) {
        await reply(waId, "Please send your full name (2–120 characters).");
        return;
      }

      draft.fullName = normalised;
      await saveWhatsAppSession(waId, "email", draft);
      await reply(waId, promptEmail());
      return;
    }

    case "email": {
      const email = normalised.toLowerCase();
      if (!isValidEmail(email) || email.length > 200) {
        await reply(waId, "Please send a valid email address.");
        return;
      }

      draft.email = email;
      await saveWhatsAppSession(waId, "phone", draft);
      await reply(waId, promptPhone(waId));
      return;
    }

    case "phone": {
      if (keyword === "yes" || keyword === "y") {
        draft.phone = formatPhoneDisplay(waId);
      } else if (normalised.length >= 7 && normalised.length <= 40) {
        draft.phone = normalised;
      } else {
        await reply(
          waId,
          "Reply *YES* to use your WhatsApp number, or send a phone number.",
        );
        return;
      }

      await saveWhatsAppSession(waId, "province", draft);
      await reply(waId, promptProvince());
      return;
    }

    case "province": {
      const province = parseListChoice(normalised, VOLUNTEER_PROVINCES);
      if (!province) {
        await reply(
          waId,
          `Please reply with a number from 1–${VOLUNTEER_PROVINCES.length}, or the province name.`,
        );
        return;
      }

      draft.province = province;
      await saveWhatsAppSession(waId, "interest", draft);
      await reply(waId, promptInterest());
      return;
    }

    case "interest": {
      const interest = parseListChoice(normalised, VOLUNTEER_INTERESTS);
      if (!interest) {
        await reply(
          waId,
          `Please reply with a number from 1–${VOLUNTEER_INTERESTS.length}, or the interest name.`,
        );
        return;
      }

      draft.interest = interest;
      await saveWhatsAppSession(waId, "message", draft);
      await reply(waId, promptMessage());
      return;
    }

    case "message": {
      if (keyword === "skip" || keyword === "-" || keyword === "none") {
        draft.message = "";
      } else if (normalised.length > 2000) {
        await reply(waId, "Please keep your message under 2000 characters, or reply *SKIP*.");
        return;
      } else {
        draft.message = normalised;
      }

      await saveWhatsAppSession(waId, "confirm", draft);
      await reply(waId, promptConfirm(draft));
      return;
    }

    case "confirm": {
      if (keyword === "yes" || keyword === "y" || keyword === "confirm") {
        await completeRegistration(waId, draft);
        return;
      }

      await reply(
        waId,
        "Reply *YES* to submit your registration, or *CANCEL* to stop.",
      );
      return;
    }

    default: {
      await clearWhatsAppSession(waId);
      await reply(waId, welcomeMessage());
    }
  }
}
