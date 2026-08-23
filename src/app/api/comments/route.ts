import { after, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { draftCommentReply } from "@/lib/agent/inbox";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { isOpenAIConfigured } from "@/lib/openai/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const articleId =
    typeof body.articleId === "string" ? body.articleId.trim() : "";
  const articleTitle =
    typeof body.articleTitle === "string"
      ? body.articleTitle.trim().slice(0, 200)
      : "";
  const authorName =
    typeof body.authorName === "string"
      ? body.authorName.trim().slice(0, 80)
      : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const message =
    typeof body.body === "string" ? body.body.trim().slice(0, 2000) : "";

  if (!articleId || !authorName || message.length < 2 || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please enter your name, a valid email, and a comment." },
      { status: 400 },
    );
  }

  const ref = await getAdminFirestore().collection("comments").add({
    articleId,
    articleTitle,
    authorName,
    email,
    body: message,
    approved: false,
    agentStatus: "queued",
    agentDraftSubject: "",
    agentDraftBody: "",
    agentError: "",
    createdAt: FieldValue.serverTimestamp(),
  });

  if (isOpenAIConfigured()) {
    after(() => draftCommentReply(ref.id));
  }

  return NextResponse.json({ ok: true, id: ref.id });
}
