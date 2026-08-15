import { NextResponse } from "next/server";
import { recordMembershipCardOrderFromCheckoutSession } from "@/lib/membership-card/record";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Backfill a membership-card order after Checkout redirects to the partner portal.
 * Safe to call repeatedly — writes are keyed by Stripe session id.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Checkout is not configured yet." },
      { status: 503 },
    );
  }

  let body: { sessionId?: unknown };

  try {
    body = (await request.json()) as { sessionId?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim() : "";

  if (!sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.checkoutType !== "membership_card") {
      return NextResponse.json(
        { error: "Not a membership card checkout session." },
        { status: 400 },
      );
    }

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json(
        { error: "Payment is not complete yet." },
        { status: 409 },
      );
    }

    const recorded = await recordMembershipCardOrderFromCheckoutSession(session);
    return NextResponse.json({ ok: true, ...recorded });
  } catch (error) {
    console.error("Membership card sync error", error);
    const message =
      typeof error === "object" &&
      error &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
        ? (error as { message: string }).message
        : "Could not sync order.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
