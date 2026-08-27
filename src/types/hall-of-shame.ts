import { VOLUNTEER_PROVINCES } from "@/types/volunteer";

export const HALL_OF_SHAME_PROVINCES = VOLUNTEER_PROVINCES.filter(
  (province) => province !== "Diaspora",
);

export const MAX_VIOLATION_PHOTOS = 4;

export const VIOLATION_ACTOR_TYPES = [
  "state",
  "individual",
  "group",
  "unknown",
] as const;

export type ViolationActorType = (typeof VIOLATION_ACTOR_TYPES)[number];

export const VIOLATION_TYPES = [
  "Assault",
  "Threats",
  "Intimidation",
  "Abduction",
  "Property damage",
  "Sexual violence",
  "Arbitrary detention",
  "Drug distribution",
  "Other",
] as const;

export type ViolationType = (typeof VIOLATION_TYPES)[number];

export const VIOLATION_STATUSES = [
  "pending",
  "published",
  "rejected",
  "held",
] as const;

export type ViolationStatus = (typeof VIOLATION_STATUSES)[number];

export const ACTOR_TYPE_LABELS: Record<ViolationActorType, string> = {
  state: "State actor",
  individual: "Individual",
  group: "Group",
  unknown: "Unknown",
};

export interface ViolationPhoto {
  storagePath: string;
  contentType: string;
  imageUrl: string;
}

export interface ViolationReport {
  id: string;
  occurredOn: string;
  province: string;
  location: string;
  actorType: ViolationActorType;
  actorName: string;
  violationTypes: ViolationType[];
  summary: string;
  evidenceNotes: string;
  anonymous: boolean;
  reporterName: string;
  reporterContact: string;
  photos: ViolationPhoto[];
  status: ViolationStatus;
  publicTitle: string;
  publicSummary: string;
  adminNotes: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  publishedAt: Date | null;
}

export interface HallOfShameCase {
  id: string;
  title: string;
  summary: string;
  occurredOn: string;
  province: string;
  location: string;
  actorType: ViolationActorType;
  actorName: string;
  violationTypes: ViolationType[];
  photos: ViolationPhoto[];
  publishedAt: Date | null;
}

export function isViolationActorType(
  value: unknown,
): value is ViolationActorType {
  return (
    typeof value === "string" &&
    (VIOLATION_ACTOR_TYPES as readonly string[]).includes(value)
  );
}

export function isViolationType(value: unknown): value is ViolationType {
  return (
    typeof value === "string" &&
    (VIOLATION_TYPES as readonly string[]).includes(value)
  );
}

export function isViolationStatus(value: unknown): value is ViolationStatus {
  return (
    typeof value === "string" &&
    (VIOLATION_STATUSES as readonly string[]).includes(value)
  );
}

export function formatViolationDate(value: string | Date | null): string {
  if (!value) {
    return "Date not given";
  }

  const date =
    value instanceof Date
      ? value
      : /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T12:00:00`)
        : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date not given";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
