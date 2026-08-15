import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";
import {
  MEMBERSHIP_CARD_AMOUNT_CENTS,
  MEMBERSHIP_CARD_CURRENCY,
  MEMBERSHIP_CARD_DISPLAY_PRICE,
} from "@/types/membership-card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveSiteUrl(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  return new URL(request.url).origin;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface CheckoutBody {
  buyerName?: unknown;
  email?: unknown;
  partnerId?: unknown;
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Checkout is not configured yet." },
      { status: 503 },
    );
  }

  if (
    !Number.isFinite(MEMBERSHIP_CARD_AMOUNT_CENTS) ||
    MEMBERSHIP_CARD_AMOUNT_CENTS < 50
  ) {
    return NextResponse.json(
      { error: "Membership card price is misconfigured." },
      { status: 500 },
    );
  }

  let body: CheckoutBody;

  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const buyerName =
    typeof body.buyerName === "string"
      ? body.buyerName.trim().slice(0, 120)
      : "";
  const email =
    typeof body.email === "string"
      ? body.email.trim().toLowerCase().slice(0, 200)
      : "";
  const partnerId =
    typeof body.partnerId === "string" ? body.partnerId.trim().slice(0, 128) : "";

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "A valid account email is required." },
      { status: 400 },
    );
  }

  try {
    const siteUrl = resolveSiteUrl(request);
    const stripe = getStripe();
    const metadata: Record<string, string> = {
      checkoutType: "membership_card",
      productName: "Membership Card",
      displayAmount: String(MEMBERSHIP_CARD_DISPLAY_PRICE),
      currency: MEMBERSHIP_CARD_CURRENCY.toUpperCase(),
      buyerName,
      email,
      ...(partnerId ? { partnerId } : {}),
    };

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      quantity: 1,
      price_data: {
        currency: MEMBERSHIP_CARD_CURRENCY,
        unit_amount: Math.round(MEMBERSHIP_CARD_AMOUNT_CENTS),
        product_data: {
          name: "Membership Card",
          description: "Sungano Ubumbano physical membership card",
        },
      },
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [lineItem],
      customer_email: email,
      metadata,
      payment_intent_data: { metadata },
      success_url: `${siteUrl}/partner?card=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/partner?card=cancelled`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not start checkout." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error) {
    console.error("Membership card checkout error", error);

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
