"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeToPublishedNewsArticles } from "@/lib/firebase/news";
import { siteConfig } from "@/lib/data";
import { cardSurfaceInteractive } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/animations";
import { formatNewsDate, type NewsArticle } from "@/types/news";

export function NewsUpdates() {
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
    <Section id="news" variant="muted">
      <SectionHeader
        title="News & Updates"
        description={`Latest news and developments from ${siteConfig.name}.`}
      />

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className={cn(cardSurfaceInteractive, "h-40 animate-pulse rounded-2xl")}
            />
          ))}
        </div>
      ) : error ? (
        <div className={cn(cardSurfaceInteractive, "rounded-2xl p-8 text-center")}>
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      ) : articles.length === 0 ? (
        <div className={cn(cardSurfaceInteractive, "rounded-2xl p-8 text-center")}>
          <p className="text-neutral-700">No news articles published yet.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.08, duration: 0.55, ease: easeOut }}
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
                    {formatNewsDate(article.publishedAt ?? article.createdAt)}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    {article.category}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-neutral-900 transition-colors group-hover:text-primary">
                  {article.title}
                </h3>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
                  {article.excerpt}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-all group-hover:opacity-100">
                  Read article
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </motion.article>
          ))}
        </div>
      )}
    </Section>
  );
}
