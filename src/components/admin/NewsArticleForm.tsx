"use client";

import { Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createNewsArticle, updateNewsArticle } from "@/lib/firebase/news";
import { cardSurface } from "@/lib/styles";
import {
  NEWS_CATEGORIES,
  type NewsArticle,
  type NewsArticleInput,
} from "@/types/news";

interface NewsArticleFormProps {
  article?: NewsArticle;
  onDelete?: () => Promise<void>;
}

function toInput(article?: NewsArticle): NewsArticleInput {
  return {
    title: article?.title ?? "",
    author: article?.author ?? "",
    category: article?.category ?? "Campaign",
    excerpt: article?.excerpt ?? "",
    body: article?.body ?? "",
    image: article?.image ?? "",
    published: article?.published ?? false,
    publishedAt: article?.publishedAt ?? new Date(),
  };
}

function toDateInputValue(date: Date | null): string {
  if (!date) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export function NewsArticleForm({ article, onDelete }: NewsArticleFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<NewsArticleInput>(() => toInput(article));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isEditing = Boolean(article);

  function updateField<K extends keyof NewsArticleInput>(
    key: K,
    value: NewsArticleInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEditing && article) {
        await updateNewsArticle(article.id, form);
      } else {
        await createNewsArticle(form);
      }

      router.push("/admin/news");
      router.refresh();
    } catch {
      setError("Unable to save this article. Check your admin permissions.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!onDelete || !window.confirm("Delete this article permanently?")) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await onDelete();
      router.push("/admin/news");
      router.refresh();
    } catch {
      setError("Unable to delete this article.");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 p-6 ${cardSurface} rounded-2xl`}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Title
          </label>
          <input
            required
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Author
          </label>
          <input
            required
            value={form.author}
            onChange={(event) => updateField("author", event.target.value)}
            placeholder="Author name"
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Category
          </label>
          <select
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            {NEWS_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Publish date
          </label>
          <input
            type="date"
            value={toDateInputValue(form.publishedAt)}
            onChange={(event) =>
              updateField(
                "publishedAt",
                event.target.value ? new Date(event.target.value) : null,
              )
            }
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Image URL
          </label>
          <input
            value={form.image}
            onChange={(event) => updateField("image", event.target.value)}
            placeholder="/images/news-civic-education.svg"
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Excerpt
          </label>
          <textarea
            required
            rows={3}
            value={form.excerpt}
            onChange={(event) => updateField("excerpt", event.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Full article
          </label>
          <textarea
            rows={8}
            value={form.body}
            onChange={(event) => updateField("body", event.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="md:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(event) => updateField("published", event.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
            />
            Published on the website
          </label>
        </div>
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={loading || deleting}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving
            </>
          ) : isEditing ? (
            "Update article"
          ) : (
            "Create article"
          )}
        </Button>

        <Link
          href="/admin/news"
          className="rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
        >
          Cancel
        </Link>

        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || deleting}
            className="ml-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
