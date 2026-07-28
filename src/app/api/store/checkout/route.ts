import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";
import { isStoreCurrency } from "@/types/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_QUANTITY = 10;

function resolveSiteUrl(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  return new URL(request.url).origin;
}

interface CheckoutBody {
  productId?: unknown;
  quantity?: unknown;
  buyerName?: unknown;
  email?: unknown;
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Store checkout is not configured yet." },
      { status: 503 },
    );
  }

  let body: CheckoutBody;

  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const productId =
    typeof body.productId === "string" ? body.productId.trim() : "";
  const quantityRaw = Number(body.quantity ?? 1);
  const quantity = Number.isFinite(quantityRaw)
    ? Math.floor(quantityRaw)
    : 1;
  const buyerName =
    typeof body.buyerName === "string"
      ? body.buyerName.trim().slice(0, 120)
      : "";
  const email =
    typeof body.email === "string"
      ? body.email.trim().toLowerCase().slice(0, 200)
      : "";

  if (!productId) {
    return NextResponse.json({ error: "Missing product." }, { status: 400 });
  }

  if (quantity < 1 || quantity > MAX_QUANTITY) {
    return NextResponse.json(
      { error: `Quantity must be between 1 and ${MAX_QUANTITY}.` },
      { status: 400 },
    );
  }

  try {
    const snapshot = await getAdminFirestore()
      .collection("products")
      .doc(productId)
      .get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const data = snapshot.data() ?? {};
    const published = Boolean(data.published);
    const name = String(data.name ?? "").trim();
    const price = Number(data.price ?? 0);
    const currencyValue = String(data.currency ?? "USD").toUpperCase();

    if (!published || !name || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "This product is not available." },
        { status: 400 },
      );
    }

    if (!isStoreCurrency(currencyValue)) {
      return NextResponse.json(
        { error: "Unsupported currency." },
        { status: 400 },
      );
    }

    const unitAmount = Math.round(price * 100);
    const siteUrl = resolveSiteUrl(request);
    const stripe = getStripe();
    const metadata: Record<string, string> = {
      checkoutType: "store",
      productId,
      productName: name.slice(0, 200),
      quantity: String(quantity),
      displayAmount: String(price * quantity),
      currency: currencyValue,
      buyerName,
      email,
    };

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      quantity,
      price_data: {
        currency: currencyValue.toLowerCase(),
        unit_amount: unitAmount,
        product_data: {
          name,
          ...(typeof data.description === "string" && data.description.trim()
            ? { description: data.description.trim().slice(0, 500) }
            : {}),
          ...(typeof data.imageUrl === "string" && data.imageUrl.trim()
            ? { images: [data.imageUrl.trim()] }
            : {}),
        },
      },
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [lineItem],
      ...(email ? { customer_email: email } : {}),
      metadata,
      payment_intent_data: { metadata },
      success_url: `${siteUrl}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/store`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not start checkout." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error) {
    console.error("Store checkout error", error);

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
