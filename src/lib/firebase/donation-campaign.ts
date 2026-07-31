import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { getClientAuth, getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  DEFAULT_DONATION_CAMPAIGN,
  type DonationCampaign,
  type DonationCampaignCurrency,
  type DonationCampaignInput,
} from "@/types/donation-campaign";

const CAMPAIGN_DOC = "content/donationCampaign";

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
}

function mapCampaign(data: Record<string, unknown>): DonationCampaign {
  const currency = String(data.currency ?? "USD").toUpperCase();

  return {
    title: String(data.title ?? DEFAULT_DONATION_CAMPAIGN.title),
    description: String(
      data.description ?? DEFAULT_DONATION_CAMPAIGN.description,
    ),
    goal: Number(data.goal ?? DEFAULT_DONATION_CAMPAIGN.goal),
    currency: (["USD", "ZAR", "GBP", "EUR"].includes(currency)
      ? currency
      : "USD") as DonationCampaignCurrency,
    raised: Number(data.raised ?? 0),
    donorCount: Number(data.donorCount ?? 0),
    published: Boolean(data.published),
    updatedAt: toDate(data.updatedAt),
  };
}

export function getDefaultDonationCampaign(): DonationCampaign {
  return {
    ...DEFAULT_DONATION_CAMPAIGN,
    raised: 0,
    donorCount: 0,
    updatedAt: null,
  };
}

export async function getDonationCampaign(): Promise<DonationCampaign> {
  if (!isFirebaseConfigured()) {
    return getDefaultDonationCampaign();
  }

  try {
    const snapshot = await getDoc(doc(getClientFirestore(), CAMPAIGN_DOC));

    if (!snapshot.exists()) {
      return getDefaultDonationCampaign();
    }

    return mapCampaign(snapshot.data());
  } catch {
    return getDefaultDonationCampaign();
  }
}

export function subscribeToDonationCampaign(
  onData: (campaign: DonationCampaign) => void,
  onError?: (error: Error) => void,
): () => void {
  if (!isFirebaseConfigured()) {
    onData(getDefaultDonationCampaign());
    return () => {};
  }

  return onSnapshot(
    doc(getClientFirestore(), CAMPAIGN_DOC),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(getDefaultDonationCampaign());
        return;
      }

      onData(mapCampaign(snapshot.data()));
    },
    (error) => onError?.(error),
  );
}

export async function saveDonationCampaign(
  input: DonationCampaignInput,
): Promise<void> {
  const db = getClientFirestore();
  const existing = await getDonationCampaign();

  await setDoc(
    doc(db, CAMPAIGN_DOC),
    {
      title: input.title.trim(),
      description: input.description.trim(),
      goal: Number(input.goal),
      currency: input.currency,
      published: input.published,
      raised: existing.raised,
      donorCount: existing.donorCount,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  const user = getClientAuth().currentUser;
  if (!user) {
    return;
  }

  const token = await user.getIdToken();
  await fetch("/api/donations/campaign/refresh", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }).catch(() => {
    // Raised totals refresh is best-effort after save.
  });
}
