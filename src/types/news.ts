export interface NewsArticle {
  id: string;
  title: string;
  author: string;
  category: string;
  excerpt: string;
  body: string;
  image: string;
  views: number;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsArticleInput {
  title: string;
  author: string;
  category: string;
  excerpt: string;
  body: string;
  image: string;
  published: boolean;
  publishedAt: Date | null;
}

export const NEWS_CATEGORIES = ["Campaign", "Justice", "Declaration", "General"] as const;

export const DEFAULT_NEWS_IMAGES: Record<string, string> = {
  Campaign: "/images/news-civic-education.svg",
  Justice: "/images/news-legal-review.svg",
  Declaration: "/images/news-declaration.svg",
  General: "/images/news-civic-education.svg",
};

export function getNewsImage(article: Pick<NewsArticle, "image" | "category">): string {
  if (article.image) {
    return article.image;
  }

  return DEFAULT_NEWS_IMAGES[article.category] ?? DEFAULT_NEWS_IMAGES.General;
}

export function formatNewsDate(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatNewsViews(views: number): string {
  const count = Math.max(0, Math.floor(views));
  return new Intl.NumberFormat("en-US").format(count);
}
