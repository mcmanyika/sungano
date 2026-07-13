"use client";

import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { ShareButtons } from "@/components/news/ShareButtons";
import { siteConfig } from "@/lib/data";
import { getPublishedNewsArticle } from "@/lib/firebase/news";
import { cardSurface } from "@/lib/styles";
import { formatNewsDate, type NewsArticle } from "@/types/news";

export function NewsArticleView() {
  const params = useParams<{ id: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      setError("");

      try {
        const nextArticle = await getPublishedNewsArticle(params.id);

        if (!nextArticle) {
          setError("This article could not be found.");
          return;
        }

        setArticle(nextArticle);
      } catch {
        setError("Unable to load this article.");
      } finally {
        setLoading(false);
      }
    }

    void loadArticle();
  }, [params.id]);

  return (
    <>
      <main className="min-h-svh bg-background pt-28 pb-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Link
            href="/#news"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to news
          </Link>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error || !article ? (
            <div className={`mt-8 p-8 text-center ${cardSurface} rounded-2xl`}>
              <p className="text-sm font-medium text-red-600">
                {error || "Article not found."}
              </p>
            </div>
          ) : (
            <article className={`mt-8 p-8 md:p-10 ${cardSurface} rounded-2xl`}>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatNewsDate(article.publishedAt ?? article.createdAt)}
                </span>
                {article.author && (
                  <span>By {article.author}</span>
                )}
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {article.category}
                </span>
              </div>

              <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="mt-5 text-lg leading-relaxed text-muted">
                  {article.excerpt}
                </p>
              )}

              <div className="mt-6 border-y border-neutral-200/80 py-4">
                <ShareButtons
                  url={`${siteConfig.url}/news/${article.id}`}
                  title={article.title}
                  description={article.excerpt}
                />
              </div>

              <div className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-neutral-700">
                {article.body || article.excerpt}
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
