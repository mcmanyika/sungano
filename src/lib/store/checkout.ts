"use client";

export type StartStoreCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function startStoreCheckout(input: {
  productId: string;
  quantity?: number;
  buyerName?: string;
  email?: string;
}): Promise<StartStoreCheckoutResult> {
  try {
    const response = await fetch("/api/store/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = (await response.json().catch(() => ({}))) as {
      url?: string;
      error?: string;
    };

    if (!response.ok || !data.url) {
      return {
        ok: false,
        error: data.error ?? "Could not start checkout. Please try again.",
      };
    }

    return { ok: true, url: data.url };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
