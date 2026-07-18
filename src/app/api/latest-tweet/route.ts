import { NextResponse } from "next/server";
import { getLatestTweet, isXConfigured } from "@/lib/x/latest-tweet";

export const revalidate = 300;

export async function GET() {
  if (!isXConfigured()) {
    return NextResponse.json(
      { tweet: null, configured: false, reason: "not-configured" },
      { status: 200 },
    );
  }

  const result = await getLatestTweet();

  if (result.ok) {
    return NextResponse.json(
      { tweet: result.tweet, configured: true, reason: null },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  }

  return NextResponse.json(
    { tweet: null, configured: true, reason: result.reason },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    },
  );
}
