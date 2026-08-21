import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/email/admin-auth";
import {
  getAdminStorage,
  getAdminStorageBucketName,
} from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function sanitizeFileName(fileName: string): string {
  const cleaned = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return (cleaned || `banner-${Date.now()}`).slice(0, 80);
}

function buildDownloadUrl(bucket: string, storagePath: string, token: string) {
  const encodedPath = encodeURIComponent(storagePath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media&token=${token}`;
}

export async function POST(request: Request) {
  const auth = await requireAdminFromRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload payload." }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Choose a JPEG, PNG, WebP, or GIF image." },
      { status: 400 },
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Image must be 10MB or smaller." },
      { status: 400 },
    );
  }

  try {
    const bucketName = getAdminStorageBucketName();
    const bucket = getAdminStorage().bucket(bucketName);
    const storagePath = `hero/banner/${Date.now()}-${sanitizeFileName(file.name)}`;
    const token = randomUUID();
    const buffer = Buffer.from(await file.arrayBuffer());

    await bucket.file(storagePath).save(buffer, {
      resumable: false,
      metadata: {
        contentType: file.type,
        cacheControl: "public,max-age=31536000,immutable",
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    return NextResponse.json({
      imageUrl: buildDownloadUrl(bucketName, storagePath, token),
      storagePath,
    });
  } catch (error) {
    console.error("Hero banner upload failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload image to storage.",
      },
      { status: 500 },
    );
  }
}
