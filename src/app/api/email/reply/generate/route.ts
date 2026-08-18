import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/email/admin-auth";
import { isOpenAIConfigured } from "@/lib/openai/config";
import { generateEmailReplyDraft } from "@/lib/openai/email-reply";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAdminFromRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      { error: "OpenAI is not configured. Add OPENAI_API_KEY." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const recipientName =
    typeof body.recipientName === "string"
      ? body.recipientName.trim().slice(0, 120)
      : "";
  const subject =
    typeof body.subject === "string" ? body.subject.trim().slice(0, 200) : "";
  const originalText =
    typeof body.originalText === "string"
      ? body.originalText.trim().slice(0, 8000)
      : "";
  const originalHtml =
    typeof body.originalHtml === "string"
      ? body.originalHtml.trim().slice(0, 12000)
      : "";

  if (!subject && !originalText && !originalHtml) {
    return NextResponse.json(
      { error: "An original email is required." },
      { status: 400 },
    );
  }

  const draft = await generateEmailReplyDraft({
    recipientName,
    subject,
    originalText,
    originalHtml,
  });

  if (!draft) {
    return NextResponse.json(
      { error: "Could not generate a reply. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json(draft);
}
