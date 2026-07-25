import "server-only";
import Stripe from "stripe";

let stripe: Stripe | undefined;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "Stripe is not configured. Add STRIPE_SECRET_KEY to your environment.",
    );
  }

  if (!stripe) {
    // Uses the API version pinned to your Stripe account by default.
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripe;
}
