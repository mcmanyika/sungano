import type { Metadata } from "next";
import { NewsArticleView } from "@/components/news/NewsArticleView";
import { siteConfig } from "@/lib/data";
import { getPublishedNewsArticle } from "@/lib/firebase/news";
import { getNewsImage } from "@/types/news";

interface NewsArticlePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: NewsArticlePageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const article = await getPublishedNewsArticle(id);

    if (!article) {
      return {
        title: "Article not found",
      };
    }

    const description =
      article.excerpt.trim() ||
      article.body.trim().slice(0, 160) ||
      siteConfig.tagline;
    const image = getNewsImage(article);
    const url = `${siteConfig.url}/news/${id}`;

    return {
      title: article.title,
      description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        type: "article",
        title: article.title,
        description,
        url,
        siteName: siteConfig.name,
        images: [
          {
            url: image,
            alt: article.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: article.title,
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: "News",
    };
  }
}

export default function NewsArticlePage() {
  return <NewsArticleView />;
}
