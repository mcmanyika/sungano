import {
  Timestamp,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  isViolationActorType,
  isViolationStatus,
  isViolationType,
  type HallOfShameCase,
  type ViolationPhoto,
  type ViolationReport,
  type ViolationType,
} from "@/types/hall-of-shame";

const REPORTS_COLLECTION = "violationReports";
const PUBLIC_COLLECTION = "hallOfShame";

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return null;
}

function mapPhotos(value: unknown): ViolationPhoto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const photo = (item ?? {}) as Record<string, unknown>;
      const storagePath = String(photo.storagePath ?? "").trim();
      if (!storagePath) {
        return null;
      }
      return {
        storagePath,
        contentType: String(photo.contentType ?? "image/jpeg"),
        imageUrl: String(photo.imageUrl ?? ""),
      };
    })
    .filter((photo): photo is ViolationPhoto => photo !== null);
}

function mapViolationTypes(value: unknown): ViolationType[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isViolationType);
}

export function mapViolationReport(
  id: string,
  data: Record<string, unknown>,
): ViolationReport {
  return {
    id,
    occurredOn: String(data.occurredOn ?? ""),
    province: String(data.province ?? ""),
    location: String(data.location ?? ""),
    actorType: isViolationActorType(data.actorType) ? data.actorType : "unknown",
    actorName: String(data.actorName ?? ""),
    violationTypes: mapViolationTypes(data.violationTypes),
    summary: String(data.summary ?? ""),
    evidenceNotes: String(data.evidenceNotes ?? ""),
    anonymous: Boolean(data.anonymous),
    reporterName: String(data.reporterName ?? ""),
    reporterContact: String(data.reporterContact ?? ""),
    photos: mapPhotos(data.photos),
    status: isViolationStatus(data.status) ? data.status : "pending",
    publicTitle: String(data.publicTitle ?? ""),
    publicSummary: String(data.publicSummary ?? ""),
    adminNotes: String(data.adminNotes ?? ""),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    publishedAt: toDate(data.publishedAt),
  };
}

export function mapHallOfShameCase(
  id: string,
  data: Record<string, unknown>,
): HallOfShameCase {
  return {
    id,
    title: String(data.title ?? ""),
    summary: String(data.summary ?? ""),
    occurredOn: String(data.occurredOn ?? ""),
    province: String(data.province ?? ""),
    location: String(data.location ?? ""),
    actorType: isViolationActorType(data.actorType) ? data.actorType : "unknown",
    actorName: String(data.actorName ?? ""),
    violationTypes: mapViolationTypes(data.violationTypes),
    photos: mapPhotos(data.photos),
    publishedAt: toDate(data.publishedAt),
  };
}

export function subscribeToPublishedHallOfShame(
  onData: (cases: HallOfShameCase[]) => void,
  onError?: (error: Error) => void,
): () => void {
  if (!isFirebaseConfigured()) {
    onData([]);
    return () => {};
  }

  const db = getClientFirestore();

  return onSnapshot(
    query(collection(db, PUBLIC_COLLECTION), orderBy("publishedAt", "desc")),
    (snapshot) => {
      onData(
        snapshot.docs.map((document) =>
          mapHallOfShameCase(document.id, document.data()),
        ),
      );
    },
    (error) => onError?.(error),
  );
}

export function subscribeToAllViolationReports(
  onData: (reports: ViolationReport[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const db = getClientFirestore();

  return onSnapshot(
    query(collection(db, REPORTS_COLLECTION), orderBy("createdAt", "desc")),
    (snapshot) => {
      onData(
        snapshot.docs.map((document) =>
          mapViolationReport(document.id, document.data()),
        ),
      );
    },
    (error) => onError?.(error),
  );
}
