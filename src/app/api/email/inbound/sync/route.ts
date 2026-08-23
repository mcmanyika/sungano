import { after, NextResponse } from "next/server";
import { draftInboundEmailReply } from "@/lib/agent/inbox";
import { requireAdminFromRequest } from "@/lib/email/admin-auth";
import { isEmailConfigured } from "@/lib/email/client";
import { syncInboundEmailsFromResend } from "@/lib/email/inbound";
import { isOpenAIConfigured } from "@/lib/openai/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAdminFromRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "Email is not configured. Add RESEND_API_KEY." },
      { status: 503 },
    );
  }

  const result = await syncInboundEmailsFromResend(50);

  if (result.error && result.synced === 0) {
    return NextResponse.json(
      {
        error:
          result.error.includes("restricted")
            ? "Your Resend API key is send-only. Create a full-access key in Resend → API Keys, then update RESEND_API_KEY."
            : result.error,
      },
      { status: 502 },
    );
  }

  if (isOpenAIConfigured()) {
    for (const id of result.ids) {
      after(() => draftInboundEmailReply(id));
    }
  }

  return NextResponse.json({
    ok: true,
    synced: result.synced,
    failed: result.failed,
  });
}
