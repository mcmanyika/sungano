import { parseYouTubeId } from "@/types/welcome-video";

export interface GalleryVideo {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GalleryVideoInput {
  title: string;
  description: string;
  youtubeId: string;
  published: boolean;
  publishedAt: Date | null;
}

export function formatVideoDate(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export { parseYouTubeId };
