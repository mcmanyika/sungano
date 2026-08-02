import "server-only";
import {
  getOpenAIApiKey,
  getOpenAIModel,
  isOpenAIConfigured,
} from "@/lib/openai/config";
import {
  VOLUNTEER_INTERESTS,
  VOLUNTEER_PROVINCES,
} from "@/types/volunteer";
import type {
  WhatsAppChatMessage,
  WhatsAppVolunteerDraft,
} from "@/types/whatsapp";

export type OpenAIVolunteerAction =
  | "continue"
  | "ready_to_confirm"
  | "cancel"
  | "restart";

export interface OpenAIVolunteerTurn {
  reply: string;
  draft: WhatsAppVolunteerDraft;
  action: OpenAIVolunteerAction;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function matchAllowed(
  value: string | undefined,
  allowed: readonly string[],
): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const trimmed = value.trim();
  const exact = allowed.find(
    (item) => item.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exact) {
    return exact;
  }

  const partial = allowed.find(
    (item) =>
      item.toLowerCase().includes(trimmed.toLowerCase()) ||
      trimmed.toLowerCase().includes(item.toLowerCase()),
  );
  return partial;
}

function sanitizeDraft(
  incoming: WhatsAppVolunteerDraft,
  previous: WhatsAppVolunteerDraft,
  waPhone: string,
): WhatsAppVolunteerDraft {
  const next: WhatsAppVolunteerDraft = { ...previous };

  if (typeof incoming.fullName === "string" && incoming.fullName.trim()) {
    next.fullName = incoming.fullName.trim().slice(0, 120);
  }

  if (typeof incoming.email === "string" && incoming.email.trim()) {
    const email = incoming.email.trim().toLowerCase().slice(0, 200);
    if (isValidEmail(email)) {
      next.email = email;
    }
  }

  if (typeof incoming.phone === "string" && incoming.phone.trim()) {
    const phone = incoming.phone.trim();
    if (
      phone.toLowerCase() === "whatsapp" ||
      phone.toLowerCase() === "same" ||
      phone.toLowerCase() === "yes"
    ) {
      next.phone = waPhone;
    } else if (phone.length >= 7 && phone.length <= 40) {
      next.phone = phone;
    }
  }

  const province = matchAllowed(incoming.province, VOLUNTEER_PROVINCES);
  if (province) {
    next.province = province;
  }

  const interest = matchAllowed(incoming.interest, VOLUNTEER_INTERESTS);
  if (interest) {
    next.interest = interest;
  }

  if (typeof incoming.message === "string") {
    next.message = incoming.message.trim().slice(0, 2000);
  }

  return next;
}

function draftIsComplete(draft: WhatsAppVolunteerDraft): boolean {
  return Boolean(
    draft.fullName?.trim() &&
      draft.email &&
      isValidEmail(draft.email) &&
      draft.phone?.trim() &&
      draft.province &&
      draft.interest,
  );
}

function buildSystemPrompt(waPhone: string): string {
  return [
    "You are the Sungano Ubumbano WhatsApp assistant.",
    "Your job is to help ordinary people register as volunteers in a warm, concise WhatsApp style.",
    "Collect these fields: fullName, email, phone, province, interest, and optional message.",
    `The user's WhatsApp number is ${waPhone}. If they agree to use it, set phone to that value.`,
    `Allowed provinces (must match exactly when set): ${VOLUNTEER_PROVINCES.join(", ")}.`,
    `Allowed interests (must match exactly when set): ${VOLUNTEER_INTERESTS.join(", ")}.`,
    "Do not invent values. Ask for one or two missing fields at a time.",
    "Keep replies under 700 characters. Use short paragraphs. You may use *bold* WhatsApp markers sparingly.",
    "If the user wants to cancel, set action to cancel.",
    "If they want to start over, set action to restart.",
    "When all required fields are present and valid, set action to ready_to_confirm and briefly say you will show a summary next.",
    "Otherwise set action to continue.",
    "Always respond with JSON only in this shape:",
    '{"reply":"string","draft":{"fullName":"","email":"","phone":"","province":"","interest":"","message":""},"action":"continue|ready_to_confirm|cancel|restart"}',
    "Only include draft keys you are updating or confirming. Leave message empty string if they skip.",
  ].join("\n");
}

function parseModelJson(content: string): Partial<OpenAIVolunteerTurn> | null {
  try {
    return JSON.parse(content) as Partial<OpenAIVolunteerTurn>;
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]) as Partial<OpenAIVolunteerTurn>;
    } catch {
      return null;
    }
  }
}

export async function runVolunteerChatTurn(input: {
  waPhone: string;
  userMessage: string;
  draft: WhatsAppVolunteerDraft;
  history: WhatsAppChatMessage[];
}): Promise<OpenAIVolunteerTurn | null> {
  if (!isOpenAIConfigured()) {
    return null;
  }

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: buildSystemPrompt(input.waPhone) },
    {
      role: "system",
      content: `Current draft so far: ${JSON.stringify(input.draft)}`,
    },
    ...input.history.map((item) => ({
      role: item.role,
      content: item.content,
    })),
    { role: "user", content: input.userMessage },
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getOpenAIApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: getOpenAIModel(),
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("OpenAI volunteer chat failed", response.status, detail);
      return null;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content?.trim() ?? "";
    const parsed = parseModelJson(content);

    if (!parsed || typeof parsed.reply !== "string" || !parsed.reply.trim()) {
      return null;
    }

    const draft = sanitizeDraft(
      parsed.draft && typeof parsed.draft === "object" ? parsed.draft : {},
      input.draft,
      input.waPhone,
    );

    let action: OpenAIVolunteerAction = "continue";
    if (
      parsed.action === "cancel" ||
      parsed.action === "restart" ||
      parsed.action === "ready_to_confirm" ||
      parsed.action === "continue"
    ) {
      action = parsed.action;
    }

    if (action === "ready_to_confirm" && !draftIsComplete(draft)) {
      action = "continue";
    }

    if (action === "continue" && draftIsComplete(draft)) {
      // Prefer confirming once we have everything, even if the model forgot.
      action = "ready_to_confirm";
    }

    return {
      reply: parsed.reply.trim().slice(0, 1500),
      draft,
      action,
    };
  } catch (error) {
    console.error("OpenAI volunteer chat error", error);
    return null;
  }
}

export { draftIsComplete };
