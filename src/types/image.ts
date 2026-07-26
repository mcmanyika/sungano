export interface GalleryImage {
  id: string;
  title: string;
  description: string;
  alt: string;
  imageUrl: string;
  storagePath: string;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GalleryImageInput {
  title: string;
  description: string;
  alt: string;
  imageUrl: string;
  storagePath: string;
  published: boolean;
  publishedAt: Date | null;
}

export function formatImageDate(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
