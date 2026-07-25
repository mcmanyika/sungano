"use client";

import { Check, Loader2, MessageSquare, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  deleteComment,
  setCommentApproved,
  subscribeToAllComments,
} from "@/lib/firebase/comments";
import { cardSurface } from "@/lib/styles";
import { formatCommentDate, type Comment } from "@/types/comment";

type Filter = "pending" | "approved" | "all";

export function CommentList() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAllComments(
      (next) => {
        setComments(next);
        setLoading(false);
      },
      () => {
        setError("Unable to load comments.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const pendingCount = useMemo(
    () => comments.filter((comment) => !comment.approved).length,
    [comments],
  );

  const filtered = useMemo(() => {
    if (filter === "pending") {
      return comments.filter((comment) => !comment.approved);
    }
    if (filter === "approved") {
      return comments.filter((comment) => comment.approved);
    }
    return comments;
  }, [comments, filter]);

  async function handleApprove(id: string, approved: boolean) {
    setBusyId(id);
    setError("");
    try {
      await setCommentApproved(id, approved);
    } catch {
      setError("Unable to update this comment.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this comment permanently?")) {
      return;
    }

    setBusyId(id);
    setError("");
    try {
      await deleteComment(id);
    } catch {
      setError("Unable to delete this comment.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900">
            Comments
          </h2>
          <p className="mt-1 text-sm text-muted">
            Moderate article comments before they appear publicly.
            {pendingCount > 0 ? ` ${pendingCount} pending.` : ""}
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-neutral-100 p-1">
          {(
            [
              { id: "pending", label: "Pending" },
              { id: "approved", label: "Approved" },
              { id: "all", label: "All" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                filter === item.id
                  ? "bg-white text-primary shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {item.label}
            </button>
          ))}
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
      ) : filtered.length === 0 ? (
        <div className={`rounded-2xl p-8 text-center ${cardSurface}`}>
          <MessageSquare className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-neutral-700">
            {filter === "pending"
              ? "No comments waiting for review."
              : "No comments yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-2xl p-5 ${cardSurface}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-900">
                    {comment.authorName}
                  </p>
                  <p className="text-sm text-muted">{comment.email}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatCommentDate(comment.createdAt)}
                    {comment.articleTitle ? (
                      <>
                        {" · "}
                        <Link
                          href={`/news/${comment.articleId}`}
                          className="text-primary underline-offset-2 hover:underline"
                        >
                          {comment.articleTitle}
                        </Link>
                      </>
                    ) : null}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    comment.approved
                      ? "bg-accent/10 text-accent"
                      : "bg-secondary/15 text-secondary-dark"
                  }`}
                >
                  {comment.approved ? "Approved" : "Pending"}
                </span>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                {comment.body}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {!comment.approved ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={busyId === comment.id}
                    onClick={() => void handleApprove(comment.id, true)}
                  >
                    {busyId === comment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Approve
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busyId === comment.id}
                    onClick={() => void handleApprove(comment.id, false)}
                  >
                    {busyId === comment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Unpublish
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                  disabled={busyId === comment.id}
                  onClick={() => void handleDelete(comment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
