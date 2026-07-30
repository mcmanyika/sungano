import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/email/admin-auth";
import { refreshDonationCampaignRaised } from "@/lib/donations/campaign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAdminFromRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const result = await refreshDonationCampaignRaised();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Donation campaign refresh failed", error);
    return NextResponse.json(
      { error: "Unable to refresh campaign totals." },
      { status: 500 },
    );
  }
}
