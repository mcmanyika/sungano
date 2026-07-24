import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  parseYouTubeId,
  type GalleryVideo,
  type GalleryVideoInput,
} from "@/types/video";

const VIDEOS_COLLECTION = "videos";

function publishedVideosQuery(db: ReturnType<typeof getClientFirestore>) {
  return query(collection(db, VIDEOS_COLLECTION), where("published", "==", true));
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

function mapVideo(id: string, data: DocumentData): GalleryVideo {
  return {
    id,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    youtubeId: String(data.youtubeId ?? ""),
    published: Boolean(data.published),
    publishedAt: toDate(data.publishedAt),
    createdAt: toDate(data.createdAt) ?? new Date(),
    updatedAt: toDate(data.updatedAt) ?? new Date(),
  };
}

function getSortDate(video: GalleryVideo): Date {
  return video.publishedAt ?? video.updatedAt ?? video.createdAt;
}

export async function getPublishedVideos(): Promise<GalleryVideo[]> {
  if (!isFirebaseConfigured()) {
    return [];
  }

  try {
    const db = getClientFirestore();
    const snapshot = await getDocs(publishedVideosQuery(db));

    return snapshot.docs
      .map((document) => mapVideo(document.id, document.data()))
      .sort((a, b) => getSortDate(b).getTime() - getSortDate(a).getTime());
  } catch {
    return [];
  }
}

export function subscribeToPublishedVideos(
  onData: (videos: GalleryVideo[]) => void,
  onError?: (error: Error) => void,
): () => void {
  if (!isFirebaseConfigured()) {
    onData([]);
    return () => {};
  }

  const db = getClientFirestore();

  return onSnapshot(
    publishedVideosQuery(db),
    (snapshot) => {
      const videos = snapshot.docs
        .map((document) => mapVideo(document.id, document.data()))
        .sort((a, b) => getSortDate(b).getTime() - getSortDate(a).getTime());

      onData(videos);
    },
    (error) => onError?.(error),
  );
}

export async function getAllVideos(): Promise<GalleryVideo[]> {
  const db = getClientFirestore();
  const snapshot = await getDocs(
    query(collection(db, VIDEOS_COLLECTION), orderBy("updatedAt", "desc")),
  );

  return snapshot.docs.map((document) =>
    mapVideo(document.id, document.data()),
  );
}

export async function getVideo(id: string): Promise<GalleryVideo | null> {
  const db = getClientFirestore();
  const snapshot = await getDoc(doc(db, VIDEOS_COLLECTION, id));

  if (!snapshot.exists()) {
    return null;
  }

  return mapVideo(snapshot.id, snapshot.data());
}

export async function createVideo(input: GalleryVideoInput): Promise<string> {
  const db = getClientFirestore();
  const youtubeId = parseYouTubeId(input.youtubeId);
  const publishedAt = input.published
    ? (input.publishedAt ?? new Date())
    : null;

  const created = await addDoc(collection(db, VIDEOS_COLLECTION), {
    title: input.title.trim(),
    description: input.description.trim(),
    youtubeId,
    published: input.published,
    publishedAt,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return created.id;
}

export async function updateVideo(
  id: string,
  input: GalleryVideoInput,
): Promise<void> {
  const db = getClientFirestore();
  const youtubeId = parseYouTubeId(input.youtubeId);
  const publishedAt = input.published
    ? (input.publishedAt ?? new Date())
    : null;

  await updateDoc(doc(db, VIDEOS_COLLECTION, id), {
    title: input.title.trim(),
    description: input.description.trim(),
    youtubeId,
    published: input.published,
    publishedAt,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteVideo(id: string): Promise<void> {
  const db = getClientFirestore();
  await deleteDoc(doc(db, VIDEOS_COLLECTION, id));
}
