"use client";

import { Inbox, Loader2, MailOpen, RefreshCw, Reply, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getClientAuth } from "@/lib/firebase/client";
import {
  markInboundEmailRead,
  subscribeToInboundEmails,
} from "@/lib/firebase/inbound-emails";
import { siteConfig } from "@/lib/data";
import { cardSurface } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { requestEmailReplyDraft } from "@/lib/email/request-reply-draft";
import {
  formatInboundDate,
  parseSenderDisplay,
  resolveInboxReplyRecipient,
  type InboundEmail,
} from "@/types/inbound-email";

export function InboundEmailInbox() {
  const [emails, setEmails] = useState<InboundEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [syncMessage, setSyncMessage] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replyGenerating, setReplyGenerating] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToInboundEmails(
      (next) => {
        setEmails(next);
        setLoading(false);
        setSelectedId((current) => {
          if (current && next.some((email) => email.id === current)) {
            return current;
          }
          return next[0]?.id ?? null;
        });
      },
      () => {
        setError("Unable to load inbound emails.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const selected = useMemo(
    () => emails.find((email) => email.id === selectedId) ?? null,
    [emails, selectedId],
  );
  const replyRecipient = useMemo(
    () => (selected ? resolveInboxReplyRecipient(selected) : null),
    [selected],
  );

  const unreadCount = useMemo(
    () => emails.filter((email) => !email.read).length,
    [emails],
  );

  useEffect(() => {
    if (!selected || selected.read) {
      return;
    }

    void markInboundEmailRead(selected.id).catch(() => {
      // Non-blocking; list still usable if mark-read fails.
    });
  }, [selected]);

  async function syncFromResend() {
    setSyncing(true);
    setError("");
    setSyncMessage("");

    try {
      const user = getClientAuth().currentUser;
      if (!user) {
        setError("You must be signed in as an admin.");
        setSyncing(false);
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch("/api/email/inbound/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        synced?: number;
        failed?: number;
      };

      if (!response.ok) {
        setError(data.error ?? "Could not sync emails from Resend.");
        setSyncing(false);
        return;
      }

      setSyncMessage(
        `Synced ${data.synced ?? 0} email${(data.synced ?? 0) === 1 ? "" : "s"}` +
          (data.failed ? ` (${data.failed} failed)` : "") +
          ".",
      );
    } catch {
      setError("Network error while syncing.");
    } finally {
      setSyncing(false);
    }
  }

  function openReply() {
    if (!selected) {
      return;
    }

    setReplyOpen(true);
    setReplyError("");
    setReplySuccess("");
    setReplySubject(
      selected.subject.toLowerCase().startsWith("re:")
        ? selected.subject
        : `Re: ${selected.subject}`,
    );
    setReplyBody("");
    void generateReplyDraft();
  }

  async function generateReplyDraft() {
    if (!selected) {
      return;
    }

    const recipient = resolveInboxReplyRecipient(selected);
    setReplyGenerating(true);
    setReplyError("");
    setReplySuccess("");

    try {
      const draft = await requestEmailReplyDraft({
        recipientName: recipient.name,
        subject: selected.subject,
        originalText: selected.text,
        originalHtml: selected.html,
      });

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
    if (!selected) {
      return;
    }

    setReplySending(true);
    setReplyError("");
    setReplySuccess("");

    try {
      const user = getClientAuth().currentUser;
      if (!user) {
        setReplyError("You must be signed in as an admin.");
        setReplySending(false);
        return;
      }

      const recipient = resolveInboxReplyRecipient(selected);
      const token = await user.getIdToken();
      const response = await fetch("/api/email/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: recipient.email,
          recipientName: recipient.name,
          subject: replySubject,
          body: replyBody,
          originalMessage: selected.text || selected.subject,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setReplyError(data.error ?? "Could not send reply.");
        setReplySending(false);
        return;
      }

      setReplySuccess(`Reply sent to ${recipient.email}.`);
      setReplyOpen(false);
    } catch {
      setReplyError("Network error. Please try again.");
    } finally {
      setReplySending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {emails.length} message{emails.length === 1 ? "" : "s"}
          {unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void syncFromResend()}
          disabled={syncing}
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing" : "Sync from Resend"}
        </Button>
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      {syncMessage && (
        <p className="text-sm font-medium text-accent" role="status">
          {syncMessage}
        </p>
      )}

      {emails.length === 0 ? (
        <div className={`rounded-2xl p-10 text-center ${cardSurface}`}>
          <Inbox className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 font-medium text-neutral-800">
            No inbound emails yet
          </p>
          <p className="mt-2 text-sm text-muted">
            Resend is receiving mail for{" "}
            <span className="font-medium text-neutral-700">
              {siteConfig.email}
            </span>
            . Use <span className="font-medium">Sync from Resend</span> after
            switching to a full-access API key.
          </p>
        </div>
      ) : (
        <div className={`overflow-hidden rounded-2xl ${cardSurface}`}>
          <div className="grid min-h-[40rem] lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
            <div className="max-h-[min(70vh,52rem)] overflow-y-auto border-b border-neutral-200/80 lg:border-b-0 lg:border-r">
              {emails.map((email) => {
                const sender = parseSenderDisplay(email.from);
                const active = email.id === selectedId;

                return (
                  <button
                    key={email.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(email.id);
                      setReplyOpen(false);
                      setReplySuccess("");
                      setReplyError("");
                    }}
                    className={cn(
                      "block w-full border-b border-neutral-100 px-4 py-3 text-left transition last:border-b-0",
                      active ? "bg-primary/5" : "hover:bg-neutral-50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "truncate text-sm",
                          email.read
                            ? "font-medium text-neutral-700"
                            : "font-semibold text-neutral-900",
                        )}
                      >
                        {sender.name}
                      </p>
                      {!email.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-neutral-800">
                      {email.subject}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {formatInboundDate(email.receivedAt)}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex max-h-[min(70vh,52rem)] flex-col overflow-y-auto p-5 sm:p-6">
              {selected ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-bold text-neutral-900">
                        {selected.subject}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-700">
                        From{" "}
                        <span className="font-medium">
                          {parseSenderDisplay(selected.from).name}
                        </span>{" "}
                        &lt;{parseSenderDisplay(selected.from).email}&gt;
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatInboundDate(selected.receivedAt)}
                        {selected.to.length > 0
                          ? ` · To ${selected.to.join(", ")}`
                          : ""}
                      </p>
                    </div>
                    <Button type="button" onClick={openReply}>
                      <Reply className="h-4 w-4" />
                      Reply
                    </Button>
                  </div>

                  {replySuccess && (
                    <p
                      className="mt-4 text-sm font-medium text-accent"
                      role="status"
                    >
                      {replySuccess}
                    </p>
                  )}

                  {replyOpen ? (
                    <div className="mt-5 space-y-4 rounded-xl border border-neutral-200 bg-neutral-50/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Reply to {replyRecipient?.name}{" "}
                        &lt;{replyRecipient?.email}&gt;
                      </p>
                      <div>
                        <label
                          htmlFor="inbox-reply-subject"
                          className="mb-1.5 block text-sm font-medium text-neutral-700"
                        >
                          Subject
                        </label>
                        <input
                          id="inbox-reply-subject"
                          value={replySubject}
                          onChange={(event) =>
                            setReplySubject(event.target.value)
                          }
                          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      </div>
                      <div>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <label
                            htmlFor="inbox-reply-body"
                            className="block text-sm font-medium text-neutral-700"
                          >
                            Message
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void generateReplyDraft()}
                            disabled={replyGenerating || replySending}
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
                          id="inbox-reply-body"
                          rows={8}
                          value={replyBody}
                          onChange={(event) => setReplyBody(event.target.value)}
                          placeholder={
                            replyGenerating
                              ? "Generating a reply…"
                              : "Write a reply or generate one with AI"
                          }
                          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      </div>
                      {replyError && (
                        <p
                          className="text-sm font-medium text-red-600"
                          role="alert"
                        >
                          {replyError}
                        </p>
                      )}
                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setReplyOpen(false)}
                          disabled={replySending || replyGenerating}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={() => void handleReply()}
                          disabled={
                            replySending ||
                            replyGenerating ||
                            !replySubject.trim() ||
                            !replyBody.trim()
                          }
                        >
                          {replySending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Sending
                            </>
                          ) : (
                            <>
                              <Reply className="h-4 w-4" />
                              Send reply
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-6 border-t border-neutral-200/80 pt-5">
                    {selected.html ? (
                      <iframe
                        title="Email body"
                        sandbox=""
                        srcDoc={selected.html}
                        className="min-h-[220px] w-full rounded-xl border border-neutral-200 bg-white"
                      />
                    ) : selected.text ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                        {selected.text}
                      </p>
                    ) : (
                      <p className="text-sm text-muted">
                        {selected.contentPending
                          ? "Message metadata was saved, but the body could not be loaded. Your Resend API key is likely send-only — replace it with a full-access key, then click Sync from Resend."
                          : "No message body."}
                      </p>
                    )}

                    {selected.attachments.length > 0 && (
                      <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                          Attachments
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-neutral-700">
                          {selected.attachments.map((attachment) => (
                            <li key={attachment.id}>
                              {attachment.filename}
                              {attachment.size
                                ? ` (${Math.max(1, Math.round(attachment.size / 1024))} KB)`
                                : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <MailOpen className="h-8 w-8 text-muted" />
                  <p className="mt-3 text-sm text-muted">Select a message</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
