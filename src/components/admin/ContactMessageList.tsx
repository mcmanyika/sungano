"use client";

import {
  Check,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  Reply,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/data";
import { requestEmailReplyDraft } from "@/lib/email/request-reply-draft";
import { getClientAuth } from "@/lib/firebase/client";
import {
  deleteContactMessage,
  setContactStatus,
  subscribeToContactMessages,
} from "@/lib/firebase/contacts";
import { cardSurface } from "@/lib/styles";
import {
  formatContactDate,
  type ContactMessage,
  type ContactStatus,
} from "@/types/contact";

type Filter = ContactStatus | "all";

export function ContactMessageList() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("new");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ContactMessage | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replyGenerating, setReplyGenerating] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState("");

  useEffect(() => {
    return subscribeToContactMessages(
      (next) => {
        setMessages(next);
        setLoading(false);
      },
      () => {
        setError("Unable to load contact messages.");
        setLoading(false);
      },
    );
  }, []);

  const newCount = useMemo(
    () => messages.filter((message) => message.status === "new").length,
    [messages],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesStatus = filter === "all" || message.status === filter;
      const matchesSearch =
        !term ||
        [
          message.fullName,
          message.email,
          message.phone,
          message.topic,
          message.subject,
          message.message,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [filter, messages, search]);

  async function handleStatus(message: ContactMessage, status: ContactStatus) {
    setBusyId(message.id);
    setError("");
    try {
      await setContactStatus(message.id, status);
    } catch {
      setError("Unable to update this message.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(message: ContactMessage) {
    if (!window.confirm(`Delete the message from ${message.fullName}?`)) {
      return;
    }

    setBusyId(message.id);
    setError("");
    try {
      await deleteContactMessage(message.id);
    } catch {
      setError("Unable to delete this message.");
    } finally {
      setBusyId(null);
    }
  }

  function openReply(message: ContactMessage) {
    setReplyingTo(message);
    setReplySubject(`Re: ${message.subject}`);
    setReplyBody("");
    setReplyError("");
    setReplySuccess("");
    void generateReplyDraft(message);
  }

  async function generateReplyDraft(message?: ContactMessage) {
    const target = message ?? replyingTo;
    if (!target) {
      return;
    }

    setReplyGenerating(true);
    setReplyError("");
    setReplySuccess("");

    try {
      const draft = await requestEmailReplyDraft({
        recipientName: target.fullName,
        subject: `Re: ${target.subject}`,
        originalText: [
          "Website contact form",
          `Name: ${target.fullName}`,
          `Email: ${target.email}`,
          `Phone: ${target.phone || "(none)"}`,
          `Topic: ${target.topic}`,
          `Subject: ${target.subject}`,
          `Message: ${target.message}`,
        ].join("\n"),
      });

      if (!draft.ok) {
        setReplyError(draft.error);
        setReplyBody(
          `Dear ${target.fullName},\n\nThank you for contacting ${siteConfig.shortName}.\n\n`,
        );
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
          recipientName: replyingTo.fullName,
          subject: replySubject,
          body: replyBody,
          originalMessage: replyingTo.message,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setReplyError(data.error ?? "Could not send reply.");
        return;
      }

      await setContactStatus(replyingTo.id, "resolved");
      setReplySuccess(`Reply sent to ${replyingTo.email}.`);
      setReplyingTo(null);
    } catch {
      setReplyError("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900">
            Contact messages
          </h2>
          <p className="mt-1 text-sm text-muted">
            Review and reply to enquiries from the website.
            {newCount > 0 ? ` ${newCount} new.` : ""}
          </p>
        </div>
        <div className="inline-flex rounded-xl bg-neutral-100 p-1">
          {(
            [
              { id: "new", label: "New" },
              { id: "resolved", label: "Resolved" },
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

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search name, email, topic, or message"
        className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      />

      {(error || replyError || replySuccess) && (
        <p
          role={error || replyError ? "alert" : "status"}
          className={`text-sm font-medium ${
            error || replyError ? "text-red-600" : "text-accent"
          }`}
        >
          {error || replyError || replySuccess}
        </p>
      )}

      {replyingTo && (
        <div className={`space-y-4 p-5 ${cardSurface}`}>
          <div>
            <h3 className="font-semibold text-neutral-900">
              Reply to {replyingTo.fullName}
            </h3>
            <p className="text-sm text-muted">{replyingTo.email}</p>
          </div>
          <input
            value={replySubject}
            onChange={(event) => setReplySubject(event.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-primary"
            aria-label="Reply subject"
          />
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-neutral-700">Message</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void generateReplyDraft()}
                disabled={replyGenerating || busyId === replyingTo.id}
              >
                {replyGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {replyGenerating ? "Generating" : "Generate with AI"}
              </Button>
            </div>
            <textarea
              rows={7}
              value={replyBody}
              onChange={(event) => setReplyBody(event.target.value)}
              placeholder={
                replyGenerating
                  ? "Generating a reply…"
                  : "Write a reply or generate one with AI"
              }
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary"
              aria-label="Reply message"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => void handleReply()}
              disabled={
                busyId === replyingTo.id ||
                replyGenerating ||
                !replySubject.trim() ||
                !replyBody.trim()
              }
            >
              {busyId === replyingTo.id ? (
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
              disabled={replyGenerating || busyId === replyingTo.id}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`p-8 text-center ${cardSurface}`}>
          <MessageSquare className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-neutral-700">No contact messages found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((message) => (
            <article key={message.id} className={`p-5 ${cardSurface}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-neutral-900">
                    {message.subject}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-700">
                    {message.fullName} · {message.email}
                    {message.phone ? ` · ${message.phone}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {message.topic} · {formatContactDate(message.createdAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    message.status === "new"
                      ? "bg-secondary/15 text-secondary-dark"
                      : "bg-accent/10 text-accent"
                  }`}
                >
                  {message.status === "new" ? "New" : "Resolved"}
                </span>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                {message.message}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => openReply(message)}
                >
                  <Reply className="h-4 w-4" />
                  Reply
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busyId === message.id}
                  onClick={() =>
                    void handleStatus(
                      message,
                      message.status === "new" ? "resolved" : "new",
                    )
                  }
                >
                  {message.status === "new" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {message.status === "new" ? "Resolve" : "Reopen"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  disabled={busyId === message.id}
                  onClick={() => void handleDelete(message)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
