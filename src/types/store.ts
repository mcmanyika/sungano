export type StoreCurrency = "USD" | "ZAR" | "GBP" | "EUR";

export const STORE_CURRENCIES: readonly StoreCurrency[] = [
  "USD",
  "ZAR",
  "GBP",
  "EUR",
] as const;

export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: StoreCurrency;
  imageUrl: string;
  storagePath: string;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreProductInput {
  name: string;
  description: string;
  price: number;
  currency: StoreCurrency;
  imageUrl: string;
  storagePath: string;
  published: boolean;
  publishedAt: Date | null;
}

export type StoreOrderStatus = "pending" | "succeeded" | "failed";

export interface StoreOrder {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  quantity: number;
  status: StoreOrderStatus;
  buyerName: string;
  email: string;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  createdAt: Date | null;
}

export function isStoreCurrency(value: string): value is StoreCurrency {
  return (STORE_CURRENCIES as readonly string[]).includes(value);
}

export function formatStorePrice(
  amount: number,
  currency: string,
): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}

export function formatStoreDate(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
