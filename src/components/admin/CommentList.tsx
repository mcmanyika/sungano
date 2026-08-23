"use client";

import { Check, Loader2, Mail, MessageSquare, Sparkles, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { requestInboxAgentDraft } from "@/lib/email/request-agent-draft";
import { getClientAuth } from "@/lib/firebase/client";
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
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replyGenerating, setReplyGenerating] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState("");

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

  function openReply(comment: Comment) {
    setReplyingTo(comment);
    setReplyError("");
    setReplySuccess("");
    setReplySubject(
      comment.agentDraftSubject?.trim() ||
        `Re: Your comment on ${comment.articleTitle || "our article"}`,
    );
    setReplyBody(comment.agentDraftBody?.trim() ?? "");
    if (!comment.agentDraftBody?.trim()) {
      void generateReplyDraft(comment);
    }
  }

  async function generateReplyDraft(comment: Comment) {
    setReplyGenerating(true);
    setReplyError("");
    setReplySuccess("");

    try {
      const draft = await requestInboxAgentDraft("comment", comment.id);
      if (!draft.ok) {
        setReplyError(draft.error);
        return;
      }
      setReplySubject(draft.subject);
      setReplyBody(draft.body);
    } catch {
      setReplyError("Network error while generating a reply.");
    } finally {
      setReplyGenerating(false);
    }
  }

  async function handleReply() {
    if (!replyingTo || !replySubject.trim() || !replyBody.trim()) {
      setReplyError("Subject and message are required.");
      return;
    }

    setBusyId(replyingTo.id);
    setReplyError("");
    setReplySuccess("");

    try {
      const user = getClientAuth().currentUser;
      if (!user) {
        setReplyError("You must be signed in as an admin.");
        return;
      }

      const response = await fetch("/api/email/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          to: replyingTo.email,
          recipientName: replyingTo.authorName,
          subject: replySubject,
          body: replyBody,
          originalMessage: replyingTo.body,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setReplyError(data.error ?? "Could not send reply.");
        return;
      }

      setReplySuccess(`Reply sent to ${replyingTo.email}.`);
      setReplyingTo(null);
    } catch {
      setReplyError("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

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
            Moderate article comments and review AI reply drafts before sending.
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

      {(error || replyError || replySuccess) && (
        <p
          className={`text-sm font-medium ${
            error || replyError ? "text-red-600" : "text-accent"
          }`}
          role={error || replyError ? "alert" : "status"}
        >
          {error || replyError || replySuccess}
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
              {comment.agentStatus === "drafted" ? (
                <p className="mt-2 text-xs font-medium text-accent">
                  AI draft ready — review before sending.
                </p>
              ) : comment.agentStatus === "queued" ? (
                <p className="mt-2 text-xs text-muted">AI is drafting a reply.</p>
              ) : null}

              {replyingTo?.id === comment.id ? (
                <div className="mt-4 space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Reply to {comment.email}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void generateReplyDraft(comment)}
                      disabled={replyGenerating || busyId === comment.id}
                    >
                      {replyGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      {replyGenerating ? "Generating" : "Generate with AI"}
                    </Button>
                  </div>
                  <input
                    value={replySubject}
                    onChange={(event) => setReplySubject(event.target.value)}
                    className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-primary"
                    aria-label="Reply subject"
                  />
                  <textarea
                    rows={6}
                    value={replyBody}
                    onChange={(event) => setReplyBody(event.target.value)}
                    placeholder={
                      replyGenerating
                        ? "Generating a reply…"
                        : "Write a reply or generate one with AI"
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                    aria-label="Reply message"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void handleReply()}
                      disabled={
                        busyId === comment.id ||
                        replyGenerating ||
                        !replySubject.trim() ||
                        !replyBody.trim()
                      }
                    >
                      {busyId === comment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                      Send reply
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setReplyingTo(null)}
                      disabled={replyGenerating || busyId === comment.id}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}

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
                  disabled={busyId === comment.id}
                  onClick={() => openReply(comment)}
                >
                  <Mail className="h-4 w-4" />
                  Reply by email
                </Button>
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
