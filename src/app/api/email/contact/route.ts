import { NextResponse } from "next/server";
import { isEmailConfigured } from "@/lib/email/client";
import { sendContactEmails } from "@/lib/email/send";
import { CONTACT_TOPICS } from "@/types/contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isEmailConfigured()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const fullName =
    typeof body.fullName === "string" ? body.fullName.trim().slice(0, 120) : "";
  const email =
    typeof body.email === "string"
      ? body.email.trim().toLowerCase().slice(0, 200)
      : "";
  const phone =
    typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : "";
  const topic =
    typeof body.topic === "string" ? body.topic.trim().slice(0, 40) : "";
  const subject =
    typeof body.subject === "string" ? body.subject.trim().slice(0, 160) : "";
  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, 4000) : "";

  if (
    !fullName ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !CONTACT_TOPICS.some((value) => value === topic) ||
    !subject ||
    message.length < 10
  ) {
    return NextResponse.json({ error: "Invalid fields." }, { status: 400 });
  }

  const result = await sendContactEmails({
    fullName,
    email,
    phone,
    topic,
    subject,
    message,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, id: result.id });
}
