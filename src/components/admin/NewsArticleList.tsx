"use client";

import { Loader2, Pencil, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  getAllNewsArticles,
  seedNewsArticles,
} from "@/lib/firebase/news";
import { cardSurface } from "@/lib/styles";
import { formatNewsDate, type NewsArticle } from "@/types/news";

export function NewsArticleList() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setArticles(await getAllNewsArticles());
    } catch {
      setError("Unable to load news articles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  async function handleSeed() {
    setSeeding(true);
    setError("");

    try {
      const created = await seedNewsArticles();
      await loadArticles();

      if (created === 0) {
        setError("Sample articles already exist.");
      }
    } catch {
      setError("Unable to import sample articles.");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900">
            News
          </h2>
          <p className="mt-1 text-sm text-muted">
            Create and publish articles for the homepage news section.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => loadArticles()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSeed}
            disabled={seeding}
          >
            {seeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Import samples"
            )}
          </Button>
          <Button href="/admin/news/new">
            <Plus className="h-4 w-4" />
            New article
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : articles.length === 0 ? (
        <div className={`p-8 text-center ${cardSurface} rounded-2xl`}>
          <p className="text-neutral-700">No articles yet.</p>
          <p className="mt-2 text-sm text-muted">
            Import the sample articles or create your first news post.
          </p>
        </div>
      ) : (
        <div className={`overflow-hidden ${cardSurface} rounded-2xl`}>
          <div className="divide-y divide-neutral-200/80">
            {articles.map((article) => (
              <div
                key={article.id}
                className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        article.published
                          ? "bg-accent/10 text-accent"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {article.published ? "Published" : "Draft"}
                    </span>
                    <span className="text-xs text-muted">{article.category}</span>
                    {article.publishedAt && (
                      <span className="text-xs text-muted">
                        {formatNewsDate(article.publishedAt)}
                      </span>
                    )}
                    {article.author && (
                      <span className="text-xs text-muted">By {article.author}</span>
                    )}
                  </div>
                  <h3 className="mt-2 font-display text-base font-bold text-neutral-900">
                    {article.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {article.excerpt}
                  </p>
                </div>

                <Link
                  href={`/admin/news/${article.id}/edit`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-primary/20 hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
