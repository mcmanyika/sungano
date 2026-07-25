import { NextResponse } from "next/server";
import { isEmailConfigured } from "@/lib/email/client";
import { sendVolunteerEmails } from "@/lib/email/send";

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
  const province =
    typeof body.province === "string" ? body.province.trim().slice(0, 80) : "";
  const interest =
    typeof body.interest === "string" ? body.interest.trim().slice(0, 120) : "";
  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";

  if (!fullName || !email || !phone || !province || !interest) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const result = await sendVolunteerEmails({
    fullName,
    email,
    phone,
    province,
    interest,
    message,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, id: result.id });
}
