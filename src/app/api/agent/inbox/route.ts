import { NextResponse } from "next/server";
import { runInboxAgent } from "@/lib/agent/inbox";
import { requireAdminFromRequest } from "@/lib/email/admin-auth";
import { isOpenAIConfigured } from "@/lib/openai/config";

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

  const channel = body.channel === "comment" ? "comment" : "email";
  const id = typeof body.id === "string" ? body.id.trim() : "";

  if (!id) {
    return NextResponse.json({ error: "A document id is required." }, { status: 400 });
  }

  const draft = await runInboxAgent(channel, id, { force: true });

  if (!draft) {
    return NextResponse.json(
      { error: "Could not generate a reply. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json(draft);
}
