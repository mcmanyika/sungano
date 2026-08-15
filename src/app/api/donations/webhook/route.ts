import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import type Stripe from "stripe";
import {
  recordDonation,
  recordDonationFromCheckoutSession,
} from "@/lib/donations/record";
import { recordStoreOrderFromCheckoutSession } from "@/lib/store/record";
import { recordMembershipCardOrderFromCheckoutSession } from "@/lib/membership-card/record";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";
import type { DonationInterval } from "@/types/donation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function POST(request: Request) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionMeta = readMetadata(bag(session));

      if (sessionMeta.checkoutType === "store") {
        await recordStoreOrderFromCheckoutSession(session);
      } else if (sessionMeta.checkoutType === "membership_card") {
        await recordMembershipCardOrderFromCheckoutSession(session);
      } else {
        await recordDonationFromCheckoutSession(session);
      }
    } else if (event.type === "invoice.paid") {
      const invoice = bag(event.data.object);
      const billingReason = String(invoice.billing_reason ?? "");

      if (billingReason === "subscription_cycle") {
        const subscriptionDetails = bag(invoice.subscription_details);
        const parent = bag(bag(invoice.parent).subscription_details);
        const metadata = {
          ...readMetadata(parent),
          ...readMetadata(subscriptionDetails),
        };
        const invoiceId = readString(invoice, "id") ?? "";
        const amountPaid = Number(invoice.amount_paid ?? 0);

        await recordDonation(invoiceId, {
          amount: amountPaid / 100,
          currency: String(invoice.currency ?? "usd").toUpperCase(),
          interval: normaliseInterval(metadata.interval),
          status: "succeeded",
          donorName: metadata.donorName ?? "",
          email: (readString(invoice, "customer_email") ?? metadata.email ?? "")
            .trim()
            .toLowerCase(),
          partnerId: metadata.partnerId ? metadata.partnerId : null,
          message: metadata.message ?? "",
          recurring: true,
          stripeSessionId: null,
          stripeSubscriptionId: readString(invoice, "subscription"),
          stripePaymentIntentId: readString(invoice, "payment_intent"),
          receiptUrl: readString(invoice, "hosted_invoice_url"),
          createdAt: FieldValue.serverTimestamp(),
        });

        try {
          const { refreshDonationCampaignRaised } = await import(
            "@/lib/donations/campaign"
          );
          await refreshDonationCampaignRaised();
        } catch (refreshError) {
          console.error("Donation campaign refresh failed", refreshError);
        }
      }
    }
  } catch (error) {
    console.error("Stripe webhook handling error", error);
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
