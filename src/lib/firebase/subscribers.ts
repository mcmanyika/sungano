import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { Subscriber } from "@/types/subscriber";

export type SubscribeResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "not-configured" | "failed" };

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function subscribeEmail(
  email: string,
  source = "harare-declaration",
): Promise<SubscribeResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, reason: "invalid" };
  }

  if (!isFirebaseConfigured()) {
    return { ok: false, reason: "not-configured" };
  }

  try {
    const db = getClientFirestore();
    await setDoc(
      doc(db, "subscribers", normalizedEmail),
      {
        email: normalizedEmail,
        source,
        subscribedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return { ok: true };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

function mapSubscriber(id: string, data: Record<string, unknown>): Subscriber {
  const subscribedAt = data.subscribedAt;

  return {
    id,
    email: String(data.email ?? id),
    source: String(data.source ?? "unknown"),
    subscribedAt:
      subscribedAt instanceof Timestamp ? subscribedAt.toDate() : null,
  };
}

export async function getAllSubscribers(): Promise<Subscriber[]> {
  const db = getClientFirestore();
  const snapshot = await getDocs(
    query(collection(db, "subscribers"), orderBy("subscribedAt", "desc")),
  );

  return snapshot.docs.map((document) =>
    mapSubscriber(document.id, document.data()),
  );
}
