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
import type { EventInput, EventItem } from "@/types/event";

const EVENTS_COLLECTION = "events";

function publishedEventsQuery(db: ReturnType<typeof getClientFirestore>) {
  return query(collection(db, EVENTS_COLLECTION), where("published", "==", true));
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

function mapEvent(id: string, data: DocumentData): EventItem {
  return {
    id,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    location: String(data.location ?? ""),
    startAt: toDate(data.startAt),
    endAt: toDate(data.endAt),
    published: Boolean(data.published),
    createdAt: toDate(data.createdAt) ?? new Date(),
    updatedAt: toDate(data.updatedAt) ?? new Date(),
  };
}

function getSortDate(event: EventItem): Date {
  return event.startAt ?? event.updatedAt ?? event.createdAt;
}

export async function getPublishedEvents(): Promise<EventItem[]> {
  if (!isFirebaseConfigured()) {
    return [];
  }

  try {
    const db = getClientFirestore();
    const snapshot = await getDocs(publishedEventsQuery(db));

    return snapshot.docs
      .map((document) => mapEvent(document.id, document.data()))
      .sort((a, b) => getSortDate(a).getTime() - getSortDate(b).getTime());
  } catch {
    return [];
  }
}

export function subscribeToPublishedEvents(
  onData: (events: EventItem[]) => void,
  onError?: (error: Error) => void,
): () => void {
  if (!isFirebaseConfigured()) {
    onData([]);
    return () => {};
  }

  const db = getClientFirestore();

  return onSnapshot(
    publishedEventsQuery(db),
    (snapshot) => {
      const events = snapshot.docs
        .map((document) => mapEvent(document.id, document.data()))
        .sort((a, b) => getSortDate(a).getTime() - getSortDate(b).getTime());

      onData(events);
    },
    (error) => onError?.(error),
  );
}

export async function getAllEvents(): Promise<EventItem[]> {
  const db = getClientFirestore();
  const snapshot = await getDocs(
    query(collection(db, EVENTS_COLLECTION), orderBy("startAt", "desc")),
  );

  return snapshot.docs.map((document) => mapEvent(document.id, document.data()));
}

export async function getEvent(id: string): Promise<EventItem | null> {
  const db = getClientFirestore();
  const snapshot = await getDoc(doc(db, EVENTS_COLLECTION, id));

  if (!snapshot.exists()) {
    return null;
  }

  return mapEvent(snapshot.id, snapshot.data());
}

export async function createEvent(input: EventInput): Promise<string> {
  const db = getClientFirestore();

  const created = await addDoc(collection(db, EVENTS_COLLECTION), {
    title: input.title.trim(),
    description: input.description.trim(),
    location: input.location.trim(),
    startAt: input.startAt,
    endAt: input.endAt,
    published: input.published,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return created.id;
}

export async function updateEvent(id: string, input: EventInput): Promise<void> {
  const db = getClientFirestore();

  await updateDoc(doc(db, EVENTS_COLLECTION, id), {
    title: input.title.trim(),
    description: input.description.trim(),
    location: input.location.trim(),
    startAt: input.startAt,
    endAt: input.endAt,
    published: input.published,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  const db = getClientFirestore();
  await deleteDoc(doc(db, EVENTS_COLLECTION, id));
}
