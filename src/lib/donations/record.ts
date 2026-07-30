import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import type Stripe from "stripe";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { DonationInterval, DonationStatus } from "@/types/donation";

export interface DonationRecord {
  amount: number;
  currency: string;
  interval: DonationInterval;
  status: DonationStatus;
  donorName: string;
  email: string;
  partnerId: string | null;
  message: string;
  recurring: boolean;
  stripeSessionId: string | null;
  stripeSubscriptionId: string | null;
  stripePaymentIntentId: string | null;
  receiptUrl: string | null;
  createdAt: FieldValue;
}

function bag(value: unknown): Record<string, unknown> {
  return (value ?? {}) as Record<string, unknown>;
}

function readString(source: Record<string, unknown>, key: string): string | null {
  const value = source[key];
  return typeof value === "string" ? value : null;
}

function readMetadata(source: Record<string, unknown>): Record<string, string> {
  const raw = source.metadata;
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }
  return result;
}

function normaliseInterval(value: string | undefined): DonationInterval {
  if (value === "month" || value === "year") {
    return value;
  }
  return "one_time";
}

export async function recordDonation(docId: string, record: DonationRecord) {
  const db = getAdminFirestore();
  await db.collection("donations").doc(docId).set(record, { merge: true });
}

/** Persist a completed Checkout Session into Firestore (idempotent by session id). */
export async function recordDonationFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<{ id: string; email: string }> {
  const data = bag(session);
  const metadata = readMetadata(data);
  const amountTotal = Number(data.amount_total ?? 0);
  const amount =
    amountTotal > 0 ? amountTotal / 100 : Number(metadata.displayAmount ?? 0);
  const sessionId = readString(data, "id") ?? "";
  const details = bag(data.customer_details);
  const email = (readString(details, "email") ?? metadata.email ?? "")
    .trim()
    .toLowerCase();
  const interval = normaliseInterval(metadata.interval);
  const status: DonationStatus =
    data.payment_status === "paid" ? "succeeded" : "pending";
  const donorName = metadata.donorName ?? "";

  const db = getAdminFirestore();
  const ref = db.collection("donations").doc(sessionId);
  const existing = await ref.get();
  const alreadyThanked = Boolean(existing.data()?.thankYouEmailSent);

  await ref.set(
    {
      amount,
      currency: String(
        data.currency ?? metadata.currency ?? "usd",
      ).toUpperCase(),
      interval,
      status,
      donorName,
      email,
      partnerId: metadata.partnerId ? metadata.partnerId : null,
      message: metadata.message ?? "",
      recurring: data.mode === "subscription",
      stripeSessionId: sessionId,
      stripeSubscriptionId: readString(data, "subscription"),
      stripePaymentIntentId: readString(data, "payment_intent"),
      receiptUrl: null,
      createdAt: existing.exists
        ? existing.data()?.createdAt ?? FieldValue.serverTimestamp()
        : FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  if (email && status === "succeeded" && !alreadyThanked) {
    try {
      const { sendDonationThankYou } = await import("@/lib/email/send");
      const sent = await sendDonationThankYou({
        email,
        donorName,
        amount,
        currency: String(
          data.currency ?? metadata.currency ?? "usd",
        ).toUpperCase(),
        interval,
      });

      if (sent.ok) {
        await ref.set({ thankYouEmailSent: true }, { merge: true });
      }
    } catch (error) {
      console.error("Donation thank-you email failed", error);
    }
  }

  if (status === "succeeded") {
    try {
      const { refreshDonationCampaignRaised } = await import(
        "@/lib/donations/campaign"
      );
      await refreshDonationCampaignRaised();
    } catch (error) {
      console.error("Donation campaign refresh failed", error);
    }
  }

  return { id: sessionId, email };
}
