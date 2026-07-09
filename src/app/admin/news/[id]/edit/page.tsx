"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { NewsArticleForm } from "@/components/admin/NewsArticleForm";
import {
  deleteNewsArticle,
  getNewsArticle,
} from "@/lib/firebase/news";
import type { NewsArticle } from "@/types/news";

export default function AdminEditNewsPage() {
  const params = useParams<{ id: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      setError("");

      try {
        const nextArticle = await getNewsArticle(params.id);

        if (!nextArticle) {
          setError("Article not found.");
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

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return (
      <p className="text-sm font-medium text-red-600" role="alert">
        {error || "Article not found."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          Edit article
        </h2>
        <p className="mt-1 text-sm text-muted">{article.title}</p>
      </div>
      <NewsArticleForm
        article={article}
        onDelete={() => deleteNewsArticle(article.id)}
      />
    </div>
  );
}
