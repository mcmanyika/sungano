import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";
import {
  isSupportedCurrency,
  isSupportedInterval,
  MAX_DONATION_AMOUNT,
  MIN_DONATION_AMOUNT,
  type DonationInterval,
} from "@/types/donation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveSiteUrl(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  return new URL(request.url).origin;
}

interface CheckoutBody {
  amount?: unknown;
  currency?: unknown;
  interval?: unknown;
  donorName?: unknown;
  email?: unknown;
  message?: unknown;
  partnerId?: unknown;
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Donations are not configured yet." },
      { status: 503 },
    );
  }

  let body: CheckoutBody;

  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const amount = Number(body.amount);
  const currency =
    typeof body.currency === "string" ? body.currency.toUpperCase() : "";
  const interval = typeof body.interval === "string" ? body.interval : "";

  if (!Number.isFinite(amount) || amount < MIN_DONATION_AMOUNT) {
    return NextResponse.json(
      { error: "Please enter a valid amount." },
      { status: 400 },
    );
  }

  if (amount > MAX_DONATION_AMOUNT) {
    return NextResponse.json(
      { error: "That amount is too large." },
      { status: 400 },
    );
  }

  if (!isSupportedCurrency(currency)) {
    return NextResponse.json(
      { error: "Unsupported currency." },
      { status: 400 },
    );
  }

  if (!isSupportedInterval(interval)) {
    return NextResponse.json(
      { error: "Unsupported donation interval." },
      { status: 400 },
    );
  }

  const donorName =
    typeof body.donorName === "string" ? body.donorName.trim().slice(0, 120) : "";
  const email =
    typeof body.email === "string"
      ? body.email.trim().toLowerCase().slice(0, 200)
      : "";
  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, 500) : "";
  const partnerId =
    typeof body.partnerId === "string" ? body.partnerId.slice(0, 128) : "";

  const typedInterval = interval as DonationInterval;
  const recurring = typedInterval !== "one_time";
  const unitAmount = Math.round(amount * 100);
  const siteUrl = resolveSiteUrl(request);
  const stripe = getStripe();

  const metadata: Record<string, string> = {
    donorName,
    email,
    message,
    partnerId,
    interval: typedInterval,
    displayAmount: String(amount),
    currency,
  };

  try {
    const productName = recurring
      ? "Recurring donation to Sungano Ubumbano"
      : "Donation to Sungano Ubumbano";

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      quantity: 1,
      price_data: {
        currency: currency.toLowerCase(),
        unit_amount: unitAmount,
        product_data: { name: productName },
        ...(recurring
          ? {
              recurring: {
                interval: typedInterval as "month" | "year",
              },
            }
          : {}),
      },
    };

    const session = await stripe.checkout.sessions.create({
      mode: recurring ? "subscription" : "payment",
      line_items: [lineItem],
      ...(email ? { customer_email: email } : {}),
      metadata,
      ...(recurring
        ? { subscription_data: { metadata } }
        : { payment_intent_data: { metadata } }),
      success_url: `${siteUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/donate`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not start checkout." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error) {
    console.error("Stripe checkout error", error);

    const stripeMessage =
      typeof error === "object" &&
      error &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
        ? (error as { message: string }).message
        : null;

    return NextResponse.json(
      {
        error: stripeMessage
          ? `Checkout failed: ${stripeMessage}`
          : "Could not start checkout. Please try again.",
      },
      { status: 502 },
    );
  }
}
