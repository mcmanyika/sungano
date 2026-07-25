import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { getClientFirestore } from "@/lib/firebase/client";
import type { Donation, DonationInterval, DonationStatus } from "@/types/donation";

const DONATIONS_COLLECTION = "donations";

function mapDonation(id: string, data: Record<string, unknown>): Donation {
  const createdAt = data.createdAt;

  return {
    id,
    amount: typeof data.amount === "number" ? data.amount : 0,
    currency: String(data.currency ?? "USD"),
    interval: (data.interval as DonationInterval) ?? "one_time",
    status: (data.status as DonationStatus) ?? "pending",
    donorName: String(data.donorName ?? ""),
    email: String(data.email ?? ""),
    partnerId: data.partnerId ? String(data.partnerId) : null,
    message: String(data.message ?? ""),
    recurring: Boolean(data.recurring),
    stripeSessionId: data.stripeSessionId ? String(data.stripeSessionId) : null,
    stripeSubscriptionId: data.stripeSubscriptionId
      ? String(data.stripeSubscriptionId)
      : null,
    stripePaymentIntentId: data.stripePaymentIntentId
      ? String(data.stripePaymentIntentId)
      : null,
    receiptUrl: data.receiptUrl ? String(data.receiptUrl) : null,
    createdAt: createdAt instanceof Timestamp ? createdAt.toDate() : null,
  };
}

/**
 * Subscribe to donations made with the given email address. Security rules only
 * return documents whose `email` matches the authenticated user's token email.
 */
export function subscribeToDonationsByEmail(
  email: string,
  onData: (donations: Donation[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const db = getClientFirestore();
  const normalized = email.trim().toLowerCase();

  const donationsQuery = query(
    collection(db, DONATIONS_COLLECTION),
    where("email", "==", normalized),
  );

  return onSnapshot(
    donationsQuery,
    (snapshot) => {
      const donations = snapshot.docs.map((document) =>
        mapDonation(document.id, document.data()),
      );

      donations.sort((a, b) => {
        const aTime = a.createdAt?.getTime() ?? 0;
        const bTime = b.createdAt?.getTime() ?? 0;
        return bTime - aTime;
      });

      onData(donations);
    },
    (error) => onError?.(error),
  );
}

/** Admin-only listing of all donations (guarded by security rules). */
export function subscribeToAllDonations(
  onData: (donations: Donation[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const db = getClientFirestore();

  const donationsQuery = query(
    collection(db, DONATIONS_COLLECTION),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    donationsQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((document) =>
          mapDonation(document.id, document.data()),
        ),
      );
    },
    (error) => onError?.(error),
  );
}
