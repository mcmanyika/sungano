import { NextResponse } from "next/server";
import { recordStoreOrderFromCheckoutSession } from "@/lib/store/record";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Backfill a store order after Checkout redirects to the success page.
 * Safe to call repeatedly — writes are keyed by Stripe session id.
 */
export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Store checkout is not configured yet." },
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

    if (session.metadata?.checkoutType !== "store") {
      return NextResponse.json(
        { error: "Not a store checkout session." },
        { status: 400 },
      );
    }

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json(
        { error: "Payment is not complete yet." },
        { status: 409 },
      );
    }

    const recorded = await recordStoreOrderFromCheckoutSession(session);
    return NextResponse.json({ ok: true, ...recorded });
  } catch (error) {
    console.error("Store sync error", error);
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
