import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/email/admin-auth";
import {
  getAdminStorage,
  getAdminStorageBucketName,
} from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface DeleteBody {
  storagePath?: unknown;
}

export async function POST(request: Request) {
  const auth = await requireAdminFromRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: DeleteBody;

  try {
    body = (await request.json()) as DeleteBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const storagePath =
    typeof body.storagePath === "string" ? body.storagePath.trim() : "";

  if (!storagePath || !storagePath.startsWith("store/")) {
    return NextResponse.json({ error: "Invalid storage path." }, { status: 400 });
  }

  try {
    const bucket = getAdminStorage().bucket(getAdminStorageBucketName());
    await bucket.file(storagePath).delete({ ignoreNotFound: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Store product delete failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete product image.",
      },
      { status: 500 },
    );
  }
}
