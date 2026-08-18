import "server-only";
import {
  getOpenAIApiKey,
  getOpenAIModel,
  isOpenAIConfigured,
} from "@/lib/openai/config";
import { siteConfig } from "@/lib/data";

function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function parseModelJson(content: string): { subject?: string; body?: string } | null {
  try {
    return JSON.parse(content) as { subject?: string; body?: string };
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]) as { subject?: string; body?: string };
    } catch {
      return null;
    }
  }
}

export interface EmailReplyDraftInput {
  recipientName: string;
  subject: string;
  originalText?: string;
  originalHtml?: string;
}

export async function generateEmailReplyDraft(
  input: EmailReplyDraftInput,
): Promise<{ subject: string; body: string } | null> {
  if (!isOpenAIConfigured()) {
    return null;
  }

  const original =
    input.originalText?.trim() ||
    (input.originalHtml ? htmlToText(input.originalHtml) : "");

  const messages = [
    {
      role: "system" as const,
      content: [
        `You draft email replies for ${siteConfig.fullName} (${siteConfig.translation}), also known as ${siteConfig.shortName}.`,
        "Write as a staff member of a peaceful, lawful civic coalition in Zimbabwe focused on constitutional democracy.",
        "Be warm, professional, and concise. Do not invent facts, promises, dates, or legal advice.",
        "If this is a volunteer registration acknowledgement or an internal 'New registration' notice, thank the volunteer, confirm receipt, and say the team will follow up with next steps.",
        "If this is a general enquiry or contact form message, acknowledge what they wrote and say the team will follow up if more detail is needed.",
        "Write the reply to the person named in the original message, never to the organisation mailbox.",
        "Plain text only. Short paragraphs. Do not include a greeting or sign-off; the email template already adds those.",
        "Respond with JSON only: {\"subject\":\"string\",\"body\":\"string\"}.",
        "Subject should keep a Re: prefix when appropriate.",
      ].join(" "),
    },
    {
      role: "user" as const,
      content: JSON.stringify({
        recipientName: input.recipientName,
        subject: input.subject,
        originalMessage: original.slice(0, 6000),
      }),
    },
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
      console.error("OpenAI email reply draft failed", response.status, detail);
      return null;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content?.trim() ?? "";
    const parsed = parseModelJson(content);
    const subject = parsed?.subject?.trim() ?? "";
    const body = parsed?.body?.trim() ?? "";

    if (!subject || !body) {
      return null;
    }

    return {
      subject: subject.slice(0, 200),
      body: body.slice(0, 10000),
    };
  } catch (error) {
    console.error("OpenAI email reply draft error", error);
    return null;
  }
}
