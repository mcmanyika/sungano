export type DonationInterval = "one_time" | "month" | "year";

export type DonationStatus = "pending" | "succeeded" | "failed" | "refunded";

export interface Donation {
  id: string;
  amount: number;
  currency: string;
  interval: DonationInterval;
  status: DonationStatus;
  donorName: string;
  email: string;
  partnerId: string | null;
  message: string;
  recurring: boolean;
  stripeSessionId: string | null;
  stripeSubscriptionId: string | null;
  stripePaymentIntentId: string | null;
  receiptUrl: string | null;
  createdAt: Date | null;
}

export interface DonationInput {
  amount: number;
  currency: string;
  interval: DonationInterval;
  donorName?: string;
  email?: string;
  message?: string;
  partnerId?: string | null;
}

export interface DonationCurrency {
  code: string;
  label: string;
  symbol: string;
  presets: number[];
}

/** Currencies offered on the donation form. */
export const DONATION_CURRENCIES: DonationCurrency[] = [
  { code: "USD", label: "US Dollar", symbol: "$", presets: [25, 50, 100, 250] },
  { code: "ZAR", label: "SA Rand", symbol: "R", presets: [100, 250, 500, 1000] },
  { code: "GBP", label: "Pound", symbol: "£", presets: [20, 50, 100, 200] },
  { code: "EUR", label: "Euro", symbol: "€", presets: [25, 50, 100, 250] },
];

export const DONATION_INTERVALS: { value: DonationInterval; label: string }[] = [
  { value: "one_time", label: "One-time" },
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
];

export const MIN_DONATION_AMOUNT = 1;
export const MAX_DONATION_AMOUNT = 1_000_000;

export function getDonationCurrency(code: string): DonationCurrency {
  const normalized = code.trim().toUpperCase();
  return (
    DONATION_CURRENCIES.find((currency) => currency.code === normalized) ??
    DONATION_CURRENCIES[0]
  );
}

export function isSupportedCurrency(code: string): boolean {
  const normalized = code.trim().toUpperCase();
  return DONATION_CURRENCIES.some((currency) => currency.code === normalized);
}

export function isSupportedInterval(value: string): value is DonationInterval {
  return value === "one_time" || value === "month" || value === "year";
}

export function formatDonationAmount(amount: number, currency: string): string {
  const code = currency.trim().toUpperCase();

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${getDonationCurrency(code).symbol}${amount.toLocaleString()}`;
  }
}

export function describeInterval(interval: DonationInterval): string {
  switch (interval) {
    case "month":
      return "Monthly";
    case "year":
      return "Yearly";
    default:
      return "One-time";
  }
}

export function formatDonationDate(date: Date | null): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
