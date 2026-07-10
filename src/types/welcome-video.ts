export interface WelcomeVideo {
  title: string;
  description: string;
  youtubeId: string;
  published: boolean;
  updatedAt: Date | null;
}

export interface WelcomeVideoInput {
  title: string;
  description: string;
  youtubeId: string;
  published: boolean;
}

export const DEFAULT_WELCOME_VIDEO: WelcomeVideoInput = {
  title: "Welcome to Sungano Yevanhu",
  description:
    "A message on our commitment to peaceful, lawful constitutional restoration — justice in the courts, sovereignty with the people.",
  youtubeId: process.env.NEXT_PUBLIC_WELCOME_VIDEO_ID ?? "",
  published: Boolean(process.env.NEXT_PUBLIC_WELCOME_VIDEO_ID),
};

/** Extract a YouTube video ID from a URL or return the input if already an ID. */
export function parseYouTubeId(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return url.pathname.slice(1).split("/")[0] ?? "";
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery) {
        return fromQuery;
      }

      const embedMatch = url.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch?.[1]) {
        return embedMatch[1];
      }

      const shortsMatch = url.pathname.match(/\/shorts\/([^/?]+)/);
      if (shortsMatch?.[1]) {
        return shortsMatch[1];
      }
    }
  } catch {
    // Not a URL — treat as a raw ID.
  }

  return trimmed;
}
