import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/email/admin-auth";
import {
  isHallOfShameStoragePath,
  signedViolationPhotoUrl,
} from "@/lib/hall-of-shame/photos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireAdminFromRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const path = new URL(request.url).searchParams.get("path")?.trim() ?? "";

  if (!isHallOfShameStoragePath(path)) {
    return NextResponse.json({ error: "Invalid photo path." }, { status: 400 });
  }

  try {
    const url = await signedViolationPhotoUrl(path);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Hall of Shame photo URL failed", error);
    return NextResponse.json(
      { error: "Unable to load this photo." },
      { status: 500 },
    );
  }
}
