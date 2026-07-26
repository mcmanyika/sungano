import { getClientAuth } from "@/lib/firebase/client";

const MAX_GALLERY_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function assertValidGalleryImageFile(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Choose a JPEG, PNG, WebP, or GIF image.");
  }

  if (file.size > MAX_GALLERY_IMAGE_BYTES) {
    throw new Error("Image must be 10MB or smaller.");
  }
}

async function getAdminIdToken(): Promise<string> {
  const user = getClientAuth().currentUser;

  if (!user) {
    throw new Error("Sign in as an admin to manage gallery images.");
  }

  return user.getIdToken();
}

export async function uploadGalleryImage(
  imageId: string,
  file: File,
): Promise<{ imageUrl: string; storagePath: string }> {
  assertValidGalleryImageFile(file);

  const token = await getAdminIdToken();
  const formData = new FormData();
  formData.set("imageId", imageId);
  formData.set("file", file);

  const response = await fetch("/api/admin/gallery/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = (await response.json()) as {
    imageUrl?: string;
    storagePath?: string;
    error?: string;
  };

  if (!response.ok || !data.imageUrl || !data.storagePath) {
    throw new Error(data.error || "Unable to upload image.");
  }

  return {
    imageUrl: data.imageUrl,
    storagePath: data.storagePath,
  };
}

export async function deleteGalleryImage(storagePath: string): Promise<void> {
  const path = storagePath.trim();

  if (!path) {
    return;
  }

  const token = await getAdminIdToken();
  const response = await fetch("/api/admin/gallery/delete", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ storagePath: path }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error || "Unable to delete image from storage.");
  }
}
