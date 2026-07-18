export interface LatestTweet {
  id: string;
  text: string;
  createdAt: string | null;
  url: string;
  username: string;
  likeCount: number;
  replyCount: number;
  retweetCount: number;
}

export const X_USERNAME = "sunganoyevanhu";

export function formatTweetDate(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
