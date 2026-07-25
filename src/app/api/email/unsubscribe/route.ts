import { NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe-token";
import { getAdminFirestore } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function POST(request: Request) {
  let body: { email?: unknown; token?: unknown };

  try {
    body = (await request.json()) as { email?: unknown; token?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const token = typeof body.token === "string" ? body.token.trim() : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return NextResponse.json(
      { error: "This unsubscribe link is invalid or expired." },
      { status: 403 },
    );
  }

  try {
    await getAdminFirestore().collection("subscribers").doc(email).delete();
    return NextResponse.json({ ok: true, email });
  } catch (error) {
    console.error("Unsubscribe failed", error);
    return NextResponse.json(
      { error: "Could not unsubscribe. Please try again." },
      { status: 502 },
    );
  }
}
