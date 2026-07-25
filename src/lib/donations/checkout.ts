"use client";

import type { DonationInput } from "@/types/donation";

export type StartDonationResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function startDonation(
  input: DonationInput,
): Promise<StartDonationResult> {
  try {
    const response = await fetch("/api/donations/checkout", {
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
