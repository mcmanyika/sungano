import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import type Stripe from "stripe";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { StoreOrderStatus } from "@/types/store";

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

/** Persist a completed store Checkout Session (idempotent by session id). */
export async function recordStoreOrderFromCheckoutSession(
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
  const status: StoreOrderStatus =
    data.payment_status === "paid" ? "succeeded" : "pending";

  const db = getAdminFirestore();
  const ref = db.collection("storeOrders").doc(sessionId);
  const existing = await ref.get();

  await ref.set(
    {
      productId: metadata.productId ?? "",
      productName: metadata.productName ?? "Merchandise",
      amount,
      currency: String(
        data.currency ?? metadata.currency ?? "usd",
      ).toUpperCase(),
      quantity: Number(metadata.quantity ?? 1) || 1,
      status,
      buyerName: metadata.buyerName ?? "",
      email,
      stripeSessionId: sessionId,
      stripePaymentIntentId: readString(data, "payment_intent"),
      checkoutType: "store",
      createdAt: existing.exists
        ? existing.data()?.createdAt ?? FieldValue.serverTimestamp()
        : FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return { id: sessionId, email };
}
