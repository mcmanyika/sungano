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

/** Removes a duplicated leading title/paragraph that X sometimes returns. */
export function cleanTweetText(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (
    paragraphs.length >= 2 &&
    paragraphs[0].localeCompare(paragraphs[1], undefined, {
      sensitivity: "accent",
    }) === 0
  ) {
    return [paragraphs[0], ...paragraphs.slice(2)].join("\n\n");
  }

  const lines = text
    .split(/\n/)
    .map((line) => line.trimEnd());

  const first = lines.findIndex((line) => line.trim().length > 0);
  if (first === -1) {
    return text.trim();
  }

  const second = lines.findIndex(
    (line, index) => index > first && line.trim().length > 0,
  );

  if (
    second !== -1 &&
    lines[first].trim().localeCompare(lines[second].trim(), undefined, {
      sensitivity: "accent",
    }) === 0
  ) {
    return [...lines.slice(0, second), ...lines.slice(second + 1)]
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  return text.trim();
}
