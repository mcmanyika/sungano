import "server-only";
import Stripe from "stripe";

let stripe: Stripe | undefined;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error(
      "Stripe is not configured. Add STRIPE_SECRET_KEY to your environment.",
    );
  }

  if (!stripe) {
    // Uses the API version pinned to your Stripe account by default.
    stripe = new Stripe(secretKey);
  }

  return stripe;
}
