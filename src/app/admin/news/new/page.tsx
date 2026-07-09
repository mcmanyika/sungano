import { NewsArticleForm } from "@/components/admin/NewsArticleForm";

export default function AdminNewNewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          New article
        </h2>
        <p className="mt-1 text-sm text-muted">
          Create a news post for the homepage.
        </p>
      </div>
      <NewsArticleForm />
    </div>
  );
}
