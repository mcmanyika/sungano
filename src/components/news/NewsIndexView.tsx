"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeToPublishedNewsArticles } from "@/lib/firebase/news";
import { easeOut } from "@/lib/animations";
import { cardSurfaceInteractive } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { formatNewsDate, type NewsArticle } from "@/types/news";

export function NewsIndexView() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setError("News is not available right now.");
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToPublishedNewsArticles(
      (nextArticles) => {
        setArticles(nextArticles);
        setError("");
        setLoading(false);
      },
      () => {
        setError("Unable to load news from the database.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return (
    <>
      <main className="min-h-svh bg-background px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Updates
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            News
          </h1>
          <div className="mt-4 h-1 w-14 rounded-full bg-secondary" aria-hidden />
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            Statements, updates, and reports from the Coalition.
          </p>

          {loading ? (
            <div className="mt-10 flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div
              className={cn(
                cardSurfaceInteractive,
                "mt-10 rounded-2xl p-8 text-center",
              )}
            >
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          ) : articles.length === 0 ? (
            <div
              className={cn(
                cardSurfaceInteractive,
                "mt-10 rounded-2xl p-8 text-center",
              )}
            >
              <p className="text-neutral-700">No news articles published yet.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.06,
                    duration: 0.5,
                    ease: easeOut,
                  }}
                >
                  <Link
                    href={`/news/${article.id}`}
                    className={cn(
                      cardSurfaceInteractive,
                      "group relative flex h-full flex-col overflow-hidden rounded-2xl p-6",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatNewsDate(
                          article.publishedAt ?? article.createdAt,
                        )}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                        {article.category}
                      </span>
                    </div>
                    <h2 className="mt-4 font-display text-lg font-bold tracking-tight text-neutral-900 transition-colors group-hover:text-primary">
                      {article.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
                      {article.excerpt}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      Read article
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
