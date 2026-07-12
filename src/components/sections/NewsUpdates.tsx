"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeToPublishedNewsArticles } from "@/lib/firebase/news";
import { siteConfig } from "@/lib/data";
import { cardSurfaceInteractive } from "@/lib/styles";
import { cn } from "@/lib/utils";
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
    <Section id="news" variant="default">
      <SectionHeader
        title="News & Updates"
        description={`Latest news, events, and developments from ${siteConfig.name}.`}
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className={cn(cardSurfaceInteractive, "h-20 animate-pulse rounded-2xl")}
            />
          ))}
        </div>
      ) : error ? (
        <div className={cn(cardSurfaceInteractive, "p-8 text-center rounded-2xl")}>
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      ) : articles.length === 0 ? (
        <div className={cn(cardSurfaceInteractive, "p-8 text-center rounded-2xl")}>
          <p className="text-neutral-700">No news articles published yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
            >
              <Link
                href={`/news/${article.id}`}
                className={cn(cardSurfaceInteractive, "group block p-5")}
              >
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatNewsDate(article.publishedAt ?? article.createdAt)}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {article.category}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-base font-bold tracking-tight text-neutral-900 transition-colors group-hover:text-primary">
                  {article.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                  {article.excerpt}
                </p>
              </Link>
            </motion.article>
          ))}
        </div>
      )}
    </Section>
  );
}
