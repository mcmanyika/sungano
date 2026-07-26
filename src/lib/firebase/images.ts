import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  deleteGalleryImage,
  uploadGalleryImage,
} from "@/lib/firebase/storage";
import type { GalleryImage, GalleryImageInput } from "@/types/image";

const IMAGES_COLLECTION = "images";

function publishedImagesQuery(db: ReturnType<typeof getClientFirestore>) {
  return query(collection(db, IMAGES_COLLECTION), where("published", "==", true));
}

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
}

function mapImage(id: string, data: DocumentData): GalleryImage {
  return {
    id,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    alt: String(data.alt ?? ""),
    imageUrl: String(data.imageUrl ?? ""),
    storagePath: String(data.storagePath ?? ""),
    published: Boolean(data.published),
    publishedAt: toDate(data.publishedAt),
    createdAt: toDate(data.createdAt) ?? new Date(),
    updatedAt: toDate(data.updatedAt) ?? new Date(),
  };
}

function getSortDate(image: GalleryImage): Date {
  return image.publishedAt ?? image.updatedAt ?? image.createdAt;
}

function toFirestorePayload(input: GalleryImageInput) {
  const publishedAt = input.published
    ? (input.publishedAt ?? new Date())
    : null;

  return {
    title: input.title.trim(),
    description: input.description.trim(),
    alt: input.alt.trim() || input.title.trim(),
    imageUrl: input.imageUrl.trim(),
    storagePath: input.storagePath.trim(),
    published: input.published,
    publishedAt,
  };
}

export async function getPublishedImages(): Promise<GalleryImage[]> {
  if (!isFirebaseConfigured()) {
    return [];
  }

  try {
    const db = getClientFirestore();
    const snapshot = await getDocs(publishedImagesQuery(db));

    return snapshot.docs
      .map((document) => mapImage(document.id, document.data()))
      .sort((a, b) => getSortDate(b).getTime() - getSortDate(a).getTime());
  } catch {
    return [];
  }
}

export function subscribeToPublishedImages(
  onData: (images: GalleryImage[]) => void,
  onError?: (error: Error) => void,
): () => void {
  if (!isFirebaseConfigured()) {
    onData([]);
    return () => {};
  }

  const db = getClientFirestore();

  return onSnapshot(
    publishedImagesQuery(db),
    (snapshot) => {
      const images = snapshot.docs
        .map((document) => mapImage(document.id, document.data()))
        .sort((a, b) => getSortDate(b).getTime() - getSortDate(a).getTime());

      onData(images);
    },
    (error) => onError?.(error),
  );
}

export async function getAllImages(): Promise<GalleryImage[]> {
  const db = getClientFirestore();
  const snapshot = await getDocs(
    query(collection(db, IMAGES_COLLECTION), orderBy("updatedAt", "desc")),
  );

  return snapshot.docs.map((document) =>
    mapImage(document.id, document.data()),
  );
}

export async function getImage(id: string): Promise<GalleryImage | null> {
  const db = getClientFirestore();
  const snapshot = await getDoc(doc(db, IMAGES_COLLECTION, id));

  if (!snapshot.exists()) {
    return null;
  }

  return mapImage(snapshot.id, snapshot.data());
}

export async function createImage(
  input: Omit<GalleryImageInput, "imageUrl" | "storagePath">,
  file: File,
): Promise<string> {
  const db = getClientFirestore();
  const imageRef = doc(collection(db, IMAGES_COLLECTION));
  const { imageUrl, storagePath } = await uploadGalleryImage(imageRef.id, file);

  try {
    await setDoc(imageRef, {
      ...toFirestorePayload({
        ...input,
        imageUrl,
        storagePath,
      }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    await deleteGalleryImage(storagePath);
    throw error;
  }

  return imageRef.id;
}

export async function updateImage(
  id: string,
  input: Omit<GalleryImageInput, "imageUrl" | "storagePath"> &
    Partial<Pick<GalleryImageInput, "imageUrl" | "storagePath">>,
  file?: File | null,
): Promise<void> {
  const db = getClientFirestore();
  const existing = await getImage(id);

  if (!existing) {
    throw new Error("Image not found.");
  }

  let imageUrl = existing.imageUrl;
  let storagePath = existing.storagePath;
  let previousStoragePath: string | null = null;

  if (file) {
    const uploaded = await uploadGalleryImage(id, file);
    previousStoragePath = existing.storagePath;
    imageUrl = uploaded.imageUrl;
    storagePath = uploaded.storagePath;
  }

  await updateDoc(doc(db, IMAGES_COLLECTION, id), {
    ...toFirestorePayload({
      ...input,
      imageUrl,
      storagePath,
    }),
    updatedAt: serverTimestamp(),
  });

  if (previousStoragePath && previousStoragePath !== storagePath) {
    await deleteGalleryImage(previousStoragePath);
  }
}

export async function deleteImage(id: string): Promise<void> {
  const db = getClientFirestore();
  const existing = await getImage(id);

  if (!existing) {
    return;
  }

  await deleteDoc(doc(db, IMAGES_COLLECTION, id));
  await deleteGalleryImage(existing.storagePath);
}
