import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { Volunteer, VolunteerInput } from "@/types/volunteer";

const VOLUNTEERS_COLLECTION = "volunteers";

export type VolunteerRegisterResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "not-configured" | "failed" };

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

function mapVolunteer(id: string, data: Record<string, unknown>): Volunteer {
  return {
    id,
    fullName: String(data.fullName ?? ""),
    email: String(data.email ?? ""),
    phone: String(data.phone ?? ""),
    province: String(data.province ?? ""),
    interest: String(data.interest ?? ""),
    message: String(data.message ?? ""),
    registeredAt: toDate(data.registeredAt),
  };
}

export async function registerVolunteer(
  input: VolunteerInput,
): Promise<VolunteerRegisterResult> {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const province = input.province.trim();
  const interest = input.interest.trim();
  const message = (input.message ?? "").trim();

  if (
    !fullName ||
    !phone ||
    !province ||
    !interest ||
    !isValidEmail(email)
  ) {
    return { ok: false, reason: "invalid" };
  }

  if (!isFirebaseConfigured()) {
    return { ok: false, reason: "not-configured" };
  }

  try {
    const db = getClientFirestore();
    await addDoc(collection(db, VOLUNTEERS_COLLECTION), {
      fullName,
      email,
      phone,
      province,
      interest,
      message,
      registeredAt: serverTimestamp(),
    });

    return { ok: true };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

export async function getAllVolunteers(): Promise<Volunteer[]> {
  const db = getClientFirestore();
  const snapshot = await getDocs(
    query(collection(db, VOLUNTEERS_COLLECTION), orderBy("registeredAt", "desc")),
  );

  return snapshot.docs.map((document) =>
    mapVolunteer(document.id, document.data()),
  );
}

export async function deleteVolunteer(id: string): Promise<void> {
  const db = getClientFirestore();
  await deleteDoc(doc(db, VOLUNTEERS_COLLECTION, id));
}
