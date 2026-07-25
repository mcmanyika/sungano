"use client";

import { Inbox, Loader2, MailOpen, Reply } from "lucide-react";
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
import {
  formatInboundDate,
  parseSenderDisplay,
  type InboundEmail,
} from "@/types/inbound-email";

export function InboundEmailInbox() {
  const [emails, setEmails] = useState<InboundEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replySending, setReplySending] = useState(false);
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

  function openReply() {
    if (!selected) {
      return;
    }

    const sender = parseSenderDisplay(selected.from);
    setReplyOpen(true);
    setReplyError("");
    setReplySuccess("");
    setReplySubject(
      selected.subject.toLowerCase().startsWith("re:")
        ? selected.subject
        : `Re: ${selected.subject}`,
    );
    setReplyBody(`Dear ${sender.name},\n\n`);
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

      const sender = parseSenderDisplay(selected.from);
      const token = await user.getIdToken();
      const response = await fetch("/api/email/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: sender.email,
          recipientName: sender.name,
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

      setReplySuccess(`Reply sent to ${sender.email}.`);
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

  if (error) {
    return (
      <p className="text-sm font-medium text-red-600" role="alert">
        {error}
      </p>
    );
  }

  if (emails.length === 0) {
    return (
      <div className={`rounded-2xl p-10 text-center ${cardSurface}`}>
        <Inbox className="mx-auto h-8 w-8 text-muted" />
        <p className="mt-3 font-medium text-neutral-800">No inbound emails yet</p>
        <p className="mt-2 text-sm text-muted">
          Once Resend receiving is configured for{" "}
          <span className="font-medium text-neutral-700">{siteConfig.email}</span>
          , messages will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {emails.length} message{emails.length === 1 ? "" : "s"}
          {unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
        </p>
      </div>

      <div className={`overflow-hidden rounded-2xl ${cardSurface}`}>
        <div className="grid min-h-[28rem] lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <div className="max-h-[36rem] overflow-y-auto border-b border-neutral-200/80 lg:border-b-0 lg:border-r">
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

          <div className="flex max-h-[36rem] flex-col overflow-y-auto p-5 sm:p-6">
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
                  <p className="mt-4 text-sm font-medium text-accent" role="status">
                    {replySuccess}
                  </p>
                )}

                {replyOpen ? (
                  <div className="mt-5 space-y-4 rounded-xl border border-neutral-200 bg-neutral-50/70 p-4">
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
                        onChange={(event) => setReplySubject(event.target.value)}
                        className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="inbox-reply-body"
                        className="mb-1.5 block text-sm font-medium text-neutral-700"
                      >
                        Message
                      </label>
                      <textarea
                        id="inbox-reply-body"
                        rows={8}
                        value={replyBody}
                        onChange={(event) => setReplyBody(event.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                      />
                    </div>
                    {replyError && (
                      <p className="text-sm font-medium text-red-600" role="alert">
                        {replyError}
                      </p>
                    )}
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setReplyOpen(false)}
                        disabled={replySending}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => void handleReply()}
                        disabled={
                          replySending ||
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
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                      {selected.text || "No message body."}
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
    </div>
  );
}
