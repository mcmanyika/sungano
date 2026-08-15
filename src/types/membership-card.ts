export type MembershipCardOrderStatus = "pending" | "succeeded" | "failed";

export interface MembershipCardOrder {
  id: string;
  amount: number;
  currency: string;
  status: MembershipCardOrderStatus;
  buyerName: string;
  email: string;
  partnerId: string | null;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  createdAt: Date | null;
}

/** Portal-only membership card price (USD). */
export const MEMBERSHIP_CARD_AMOUNT_CENTS = 6000;
export const MEMBERSHIP_CARD_CURRENCY = "usd";
export const MEMBERSHIP_CARD_DISPLAY_PRICE = MEMBERSHIP_CARD_AMOUNT_CENTS / 100;
