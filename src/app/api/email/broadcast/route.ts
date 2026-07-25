import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/email/admin-auth";
import { isEmailConfigured } from "@/lib/email/client";
import { sendBroadcast } from "@/lib/email/send";
import { getAdminFirestore } from "@/lib/firebase/admin";

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

  let body: { subject?: unknown; body?: unknown; testEmail?: unknown };

  try {
    body = (await request.json()) as {
      subject?: unknown;
      body?: unknown;
      testEmail?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const subject =
    typeof body.subject === "string" ? body.subject.trim().slice(0, 200) : "";
  const message =
    typeof body.body === "string" ? body.body.trim().slice(0, 20000) : "";
  const testEmail =
    typeof body.testEmail === "string"
      ? body.testEmail.trim().toLowerCase()
      : "";

  if (!subject || !message) {
    return NextResponse.json(
      { error: "Subject and message are required." },
      { status: 400 },
    );
  }

  let recipients: string[] = [];

  if (testEmail) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      return NextResponse.json(
        { error: "Invalid test email." },
        { status: 400 },
      );
    }
    recipients = [testEmail];
  } else {
    const snapshot = await getAdminFirestore().collection("subscribers").get();
    recipients = snapshot.docs
      .map((doc) => String(doc.data().email ?? doc.id).trim().toLowerCase())
      .filter(Boolean);
  }

  const result = await sendBroadcast({
    subject,
    body: message,
    recipients,
  });

  if (result.error && result.sent === 0) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    sent: result.sent,
    failed: result.failed,
    recipients: recipients.length,
    test: Boolean(testEmail),
  });
}
