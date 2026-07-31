export type DonationCampaignCurrency = "USD" | "ZAR" | "GBP" | "EUR";

export interface DonationCampaign {
  title: string;
  description: string;
  goal: number;
  currency: DonationCampaignCurrency;
  raised: number;
  donorCount: number;
  published: boolean;
  updatedAt: Date | null;
}

export interface DonationCampaignInput {
  title: string;
  description: string;
  goal: number;
  currency: DonationCampaignCurrency;
  published: boolean;
}

export const DEFAULT_DONATION_CAMPAIGN: DonationCampaignInput = {
  title: "Fund the movement",
  description:
    "Help us reach this goal for civic education, community dialogues, and peaceful constitutional work.",
  goal: 50000,
  currency: "USD",
  published: false,
};

export function donationProgressPercent(raised: number, goal: number): number {
  if (!Number.isFinite(goal) || goal <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (raised / goal) * 100));
}
