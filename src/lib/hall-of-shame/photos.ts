import "server-only";
import { randomUUID } from "crypto";
import {
  getAdminStorage,
  getAdminStorageBucketName,
} from "@/lib/firebase/admin";
import {
  type ViolationPhoto,
} from "@/types/hall-of-shame";

export const MAX_VIOLATION_PHOTO_BYTES = 5 * 1024 * 1024;
export const ALLOWED_VIOLATION_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function sanitizeFileName(fileName: string): string {
  const cleaned = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || `photo-${Date.now()}`;
}

export function buildStorageDownloadUrl(
  bucket: string,
  storagePath: string,
  token: string,
) {
  const encodedPath = encodeURIComponent(storagePath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media&token=${token}`;
}

export function isHallOfShameStoragePath(path: string): boolean {
  return (
    path.startsWith("hall-of-shame/pending/") ||
    path.startsWith("hall-of-shame/published/")
  );
}

export async function savePendingViolationPhoto(
  reportId: string,
  file: File,
  index: number,
): Promise<ViolationPhoto> {
  if (!ALLOWED_VIOLATION_PHOTO_TYPES.has(file.type)) {
    throw new Error("Photos must be JPEG, PNG, or WebP.");
  }

  if (file.size > MAX_VIOLATION_PHOTO_BYTES) {
    throw new Error("Each photo must be 5MB or smaller.");
  }

  const bucketName = getAdminStorageBucketName();
  const bucket = getAdminStorage().bucket(bucketName);
  const storagePath = `hall-of-shame/pending/${reportId}/${index}-${sanitizeFileName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await bucket.file(storagePath).save(buffer, {
    resumable: false,
    metadata: {
      contentType: file.type,
      cacheControl: "private, max-age=0",
    },
  });

  return {
    storagePath,
    contentType: file.type,
    imageUrl: "",
  };
}

export async function publishViolationPhotos(
  photos: ViolationPhoto[],
): Promise<ViolationPhoto[]> {
  const bucketName = getAdminStorageBucketName();
  const bucket = getAdminStorage().bucket(bucketName);
  const published: ViolationPhoto[] = [];

  for (const photo of photos) {
    if (photo.imageUrl && photo.storagePath.startsWith("hall-of-shame/published/")) {
      published.push(photo);
      continue;
    }

    const destPath = photo.storagePath.replace(
      "hall-of-shame/pending/",
      "hall-of-shame/published/",
    );
    const token = randomUUID();
    const source = bucket.file(photo.storagePath);
    const destination = bucket.file(destPath);
    const [exists] = await source.exists();

    if (!exists) {
      continue;
    }

    await source.copy(destination);
    await destination.setMetadata({
      contentType: photo.contentType,
      cacheControl: "public,max-age=31536000,immutable",
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    });

    published.push({
      storagePath: destPath,
      contentType: photo.contentType,
      imageUrl: buildStorageDownloadUrl(bucketName, destPath, token),
    });
  }

  return published;
}

export async function deleteViolationPhotoPaths(paths: string[]): Promise<void> {
  const bucket = getAdminStorage().bucket(getAdminStorageBucketName());

  await Promise.all(
    paths
      .filter((path) => isHallOfShameStoragePath(path))
      .map(async (path) => {
        try {
          await bucket.file(path).delete({ ignoreNotFound: true });
        } catch {
          // Storage cleanup is best-effort.
        }
      }),
  );
}

export async function signedViolationPhotoUrl(storagePath: string): Promise<string> {
  if (!isHallOfShameStoragePath(storagePath)) {
    throw new Error("Invalid photo path.");
  }

  const bucket = getAdminStorage().bucket(getAdminStorageBucketName());
  const [url] = await bucket.file(storagePath).getSignedUrl({
    action: "read",
    expires: Date.now() + 15 * 60 * 1000,
  });

  return url;
}
