"use client";

import { Loader2, MessageSquare } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  createComment,
  subscribeToApprovedComments,
} from "@/lib/firebase/comments";
import {
  formatCommentDate,
  type Comment,
} from "@/types/comment";

const fieldClassName =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

interface CommentSectionProps {
  articleId: string;
  articleTitle: string;
}

export function CommentSection({
  articleId,
  articleTitle,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadedForArticleId, setLoadedForArticleId] = useState<string | null>(
    null,
  );
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const loading = loadedForArticleId !== articleId;

  useEffect(() => {
    const unsubscribe = subscribeToApprovedComments(
      articleId,
      (next) => {
        setComments(next);
        setLoadedForArticleId(articleId);
      },
      () => setLoadedForArticleId(articleId),
    );

    return unsubscribe;
  }, [articleId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const result = await createComment({
      articleId,
      articleTitle,
      authorName,
      email,
      body,
    });

    if (result.ok) {
      setStatus("success");
      setMessage(
        "Thank you. Your comment was submitted and will appear after review.",
      );
      setAuthorName("");
      setEmail("");
      setBody("");
      return;
    }

    setStatus("error");
    if (result.reason === "invalid") {
      setMessage("Please enter your name, a valid email, and a comment.");
      return;
    }
    if (result.reason === "not-configured") {
      setMessage("Comments are not available right now.");
      return;
    }
    setMessage("Something went wrong. Please try again.");
  }

  return (
    <section className="mt-10 border-t border-neutral-200/80 pt-8">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold text-neutral-900">
          Comments
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="comment-name"
              className="mb-1.5 block text-sm font-medium text-neutral-700"
            >
              Name
            </label>
            <input
              id="comment-name"
              required
              maxLength={80}
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              className={fieldClassName}
              placeholder="Your name"
            />
          </div>
          <div>
            <label
              htmlFor="comment-email"
              className="mb-1.5 block text-sm font-medium text-neutral-700"
            >
              Email
            </label>
            <input
              id="comment-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={fieldClassName}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="comment-body"
            className="mb-1.5 block text-sm font-medium text-neutral-700"
          >
            Comment
          </label>
          <textarea
            id="comment-body"
            required
            rows={4}
            maxLength={2000}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            placeholder="Share your thoughts"
          />
        </div>

        {message && (
          <p
            className={`text-sm font-medium ${
              status === "success" ? "text-accent" : "text-red-600"
            }`}
            role={status === "error" ? "alert" : "status"}
          >
            {message}
          </p>
        )}

        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting
            </>
          ) : (
            "Post comment"
          )}
        </Button>
      </form>

      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted">
            No comments yet. Be the first to share a reflection.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-5 py-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-neutral-900">
                  {comment.authorName}
                </p>
                <p className="text-xs text-muted">
                  {formatCommentDate(comment.createdAt)}
                </p>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                {comment.body}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
