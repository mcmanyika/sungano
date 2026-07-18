import {
  formatTweetDate,
  X_USERNAME,
  type LatestTweet,
} from "@/types/x";

const X_API_BASE = "https://api.x.com/2";

interface XUserResponse {
  data?: {
    id: string;
    username: string;
    name?: string;
  };
  title?: string;
  detail?: string;
  status?: number;
}

interface XTweetsResponse {
  data?: Array<{
    id: string;
    text: string;
    created_at?: string;
    public_metrics?: {
      like_count?: number;
      reply_count?: number;
      retweet_count?: number;
    };
  }>;
  title?: string;
  detail?: string;
  status?: number;
}

export type LatestTweetResult =
  | { ok: true; tweet: LatestTweet }
  | { ok: false; reason: "not-configured" | "credits" | "unavailable" | "empty" };

function getBearerToken(): string | null {
  const token = process.env.X_BEARER_TOKEN?.trim();
  return token || null;
}

export function isXConfigured(): boolean {
  return Boolean(getBearerToken());
}

function isCreditsError(status: number, body: { title?: string; detail?: string }) {
  return (
    status === 402 ||
    body.title?.toLowerCase().includes("payment") ||
    body.detail?.toLowerCase().includes("credits")
  );
}

export async function getLatestTweet(): Promise<LatestTweetResult> {
  const token = getBearerToken();

  if (!token) {
    return { ok: false, reason: "not-configured" };
  }

  try {
    const userResponse = await fetch(
      `${X_API_BASE}/users/by/username/${X_USERNAME}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 300 },
      },
    );

    const userPayload = (await userResponse.json()) as XUserResponse;

    if (!userResponse.ok) {
      if (isCreditsError(userResponse.status, userPayload)) {
        return { ok: false, reason: "credits" };
      }
      return { ok: false, reason: "unavailable" };
    }

    const userId = userPayload.data?.id;
    const username = userPayload.data?.username ?? X_USERNAME;

    if (!userId) {
      return { ok: false, reason: "unavailable" };
    }

    const tweetsResponse = await fetch(
      `${X_API_BASE}/users/${userId}/tweets?max_results=5&exclude=replies,retweets&tweet.fields=created_at,public_metrics,text`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 300 },
      },
    );

    const tweetsPayload = (await tweetsResponse.json()) as XTweetsResponse;

    if (!tweetsResponse.ok) {
      if (isCreditsError(tweetsResponse.status, tweetsPayload)) {
        return { ok: false, reason: "credits" };
      }
      return { ok: false, reason: "unavailable" };
    }

    const tweet = tweetsPayload.data?.[0];

    if (!tweet) {
      return { ok: false, reason: "empty" };
    }

    return {
      ok: true,
      tweet: {
        id: tweet.id,
        text: tweet.text,
        createdAt: tweet.created_at ?? null,
        url: `https://x.com/${username}/status/${tweet.id}`,
        username,
        likeCount: tweet.public_metrics?.like_count ?? 0,
        replyCount: tweet.public_metrics?.reply_count ?? 0,
        retweetCount: tweet.public_metrics?.retweet_count ?? 0,
      },
    };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

export { formatTweetDate, X_USERNAME };
