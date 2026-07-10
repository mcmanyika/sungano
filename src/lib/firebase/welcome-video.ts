import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  DEFAULT_WELCOME_VIDEO,
  parseYouTubeId,
  type WelcomeVideo,
  type WelcomeVideoInput,
} from "@/types/welcome-video";

const WELCOME_VIDEO_DOC = "content/welcome-video";

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
}

function mapWelcomeVideo(data: Record<string, unknown>): WelcomeVideo {
  const youtubeId = String(data.youtubeId ?? DEFAULT_WELCOME_VIDEO.youtubeId).trim();
  const published =
    typeof data.published === "boolean"
      ? data.published
      : Boolean(youtubeId);

  return {
    title: String(data.title ?? DEFAULT_WELCOME_VIDEO.title),
    description: String(data.description ?? DEFAULT_WELCOME_VIDEO.description),
    youtubeId,
    published,
    updatedAt: toDate(data.updatedAt),
  };
}

export function getDefaultWelcomeVideo(): WelcomeVideo {
  return {
    ...DEFAULT_WELCOME_VIDEO,
    updatedAt: null,
  };
}

export async function getWelcomeVideo(): Promise<WelcomeVideo> {
  if (!isFirebaseConfigured()) {
    return getDefaultWelcomeVideo();
  }

  try {
    const db = getClientFirestore();
    const snapshot = await getDoc(doc(db, WELCOME_VIDEO_DOC));

    if (!snapshot.exists()) {
      return getDefaultWelcomeVideo();
    }

    return mapWelcomeVideo(snapshot.data());
  } catch {
    return getDefaultWelcomeVideo();
  }
}

export function subscribeToWelcomeVideo(
  onData: (video: WelcomeVideo) => void,
  onError?: (error: Error) => void,
): () => void {
  if (!isFirebaseConfigured()) {
    onData(getDefaultWelcomeVideo());
    return () => {};
  }

  const db = getClientFirestore();

  return onSnapshot(
    doc(db, WELCOME_VIDEO_DOC),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(getDefaultWelcomeVideo());
        return;
      }

      onData(mapWelcomeVideo(snapshot.data()));
    },
    (error) => onError?.(error),
  );
}

export async function saveWelcomeVideo(input: WelcomeVideoInput): Promise<void> {
  const db = getClientFirestore();

  await setDoc(
    doc(db, WELCOME_VIDEO_DOC),
    {
      title: input.title.trim(),
      description: input.description.trim(),
      youtubeId: parseYouTubeId(input.youtubeId),
      published: input.published,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
