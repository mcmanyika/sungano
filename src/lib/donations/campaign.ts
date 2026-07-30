import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { DEFAULT_DONATION_CAMPAIGN } from "@/types/donation-campaign";

const CAMPAIGN_DOC = "content/donationCampaign";

export interface DonationCampaignProgress {
  title: string;
  description: string;
  goal: number;
  currency: string;
  raised: number;
  donorCount: number;
  published: boolean;
}

function readCampaignSettings(
  data: Record<string, unknown> | undefined,
): Omit<DonationCampaignProgress, "raised" | "donorCount"> {
  const currency = String(
    data?.currency ?? DEFAULT_DONATION_CAMPAIGN.currency,
  ).toUpperCase();

  return {
    title: String(data?.title ?? DEFAULT_DONATION_CAMPAIGN.title),
    description: String(
      data?.description ?? DEFAULT_DONATION_CAMPAIGN.description,
    ),
    goal: Number(data?.goal ?? DEFAULT_DONATION_CAMPAIGN.goal),
    currency: ["USD", "ZAR", "GBP", "EUR"].includes(currency)
      ? currency
      : "USD",
    published:
      data == null
        ? DEFAULT_DONATION_CAMPAIGN.published
        : data.published !== false,
  };
}

/** Sum succeeded gifts from the `donations` collection for a currency. */
export async function sumSucceededDonations(currency: string): Promise<{
  raised: number;
  donorCount: number;
}> {
  const db = getAdminFirestore();
  const donations = await db
    .collection("donations")
    .where("status", "==", "succeeded")
    .get();

  const target = currency.toUpperCase();
  let raised = 0;
  let donorCount = 0;

  for (const document of donations.docs) {
    const donation = document.data();
    if (String(donation.currency ?? "").toUpperCase() !== target) {
      continue;
    }

    const amount = Number(donation.amount ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      continue;
    }

    raised += amount;
    donorCount += 1;
  }

  return { raised, donorCount };
}

/** Live progress: campaign settings + totals from `donations`. */
export async function getDonationCampaignProgress(): Promise<DonationCampaignProgress> {
  const db = getAdminFirestore();
  const snapshot = await db.doc(CAMPAIGN_DOC).get();
  const settings = readCampaignSettings(
    snapshot.exists ? (snapshot.data() as Record<string, unknown>) : undefined,
  );
  const totals = await sumSucceededDonations(settings.currency);

  return {
    ...settings,
    ...totals,
  };
}

/** Recompute and cache raised totals on the campaign doc from `donations`. */
export async function refreshDonationCampaignRaised(): Promise<{
  raised: number;
  donorCount: number;
  currency: string;
}> {
  const db = getAdminFirestore();
  const ref = db.doc(CAMPAIGN_DOC);
  const snapshot = await ref.get();
  const settings = readCampaignSettings(
    snapshot.exists ? (snapshot.data() as Record<string, unknown>) : undefined,
  );
  const totals = await sumSucceededDonations(settings.currency);

  await ref.set(
    {
      title: settings.title,
      description: settings.description,
      goal: settings.goal,
      currency: settings.currency,
      published: settings.published,
      raised: totals.raised,
      donorCount: totals.donorCount,
      raisedUpdatedAt: FieldValue.serverTimestamp(),
      updatedAt: snapshot.exists
        ? snapshot.data()?.updatedAt ?? FieldValue.serverTimestamp()
        : FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return {
    raised: totals.raised,
    donorCount: totals.donorCount,
    currency: settings.currency,
  };
}
