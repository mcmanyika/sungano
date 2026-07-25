import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/email/admin-auth";
import { isEmailConfigured } from "@/lib/email/client";
import { sendVolunteerReply } from "@/lib/email/send";

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

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const to =
    typeof body.to === "string" ? body.to.trim().toLowerCase().slice(0, 200) : "";
  const recipientName =
    typeof body.recipientName === "string"
      ? body.recipientName.trim().slice(0, 120)
      : "";
  const subject =
    typeof body.subject === "string" ? body.subject.trim().slice(0, 200) : "";
  const message =
    typeof body.body === "string" ? body.body.trim().slice(0, 10000) : "";
  const originalMessage =
    typeof body.originalMessage === "string"
      ? body.originalMessage.trim().slice(0, 2000)
      : "";

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Invalid recipient." }, { status: 400 });
  }

  if (!subject || !message) {
    return NextResponse.json(
      { error: "Subject and message are required." },
      { status: 400 },
    );
  }

  const result = await sendVolunteerReply({
    to,
    recipientName,
    subject,
    body: message,
    originalMessage,
    replyTo: auth.email,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, id: result.id });
}
