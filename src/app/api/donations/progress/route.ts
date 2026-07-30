import { NextResponse } from "next/server";
import { getDonationCampaignProgress } from "@/lib/donations/campaign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public progress for the landing tracker — totals come from `donations`. */
export async function GET() {
  try {
    const progress = await getDonationCampaignProgress();
    return NextResponse.json(progress);
  } catch (error) {
    console.error("Donation progress lookup failed", error);
    return NextResponse.json(
      { error: "Unable to load donation progress." },
      { status: 500 },
    );
  }
}
