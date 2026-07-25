"use client";

import { Loader2, Send } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getClientAuth } from "@/lib/firebase/client";
import { getAllSubscribers } from "@/lib/firebase/subscribers";
import { cardSurface } from "@/lib/styles";

export function EmailBroadcastForm() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void getAllSubscribers()
      .then((subscribers) => setSubscriberCount(subscribers.length))
      .catch(() => setSubscriberCount(null));
  }, []);

  async function send(options: { test?: boolean }) {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const user = getClientAuth().currentUser;

      if (!user) {
        setError("You must be signed in as an admin.");
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch("/api/email/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          body,
          ...(options.test ? { testEmail: testEmail.trim() } : {}),
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        sent?: number;
        failed?: number;
        recipients?: number;
        test?: boolean;
      };

      if (!response.ok) {
        setError(data.error ?? "Could not send email.");
        setLoading(false);
        return;
      }

      if (data.test) {
        setSuccess(`Test email sent to ${testEmail.trim()}.`);
      } else {
        setSuccess(
          `Broadcast complete: ${data.sent ?? 0} sent` +
            (data.failed ? `, ${data.failed} failed` : "") +
            ` of ${data.recipients ?? 0} subscribers.`,
        );
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !window.confirm(
        `Send this email to all ${subscriberCount ?? ""} subscribers?`,
      )
    ) {
      return;
    }

    await send({ test: false });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          Email broadcast
        </h2>
        <p className="mt-1 text-sm text-muted">
          Send an update to everyone on the website subscriber list
          {subscriberCount !== null ? ` (${subscriberCount})` : ""}.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`space-y-5 rounded-2xl p-6 ${cardSurface}`}
      >
        <div>
          <label
            htmlFor="email-subject"
            className="mb-1.5 block text-sm font-medium text-neutral-700"
          >
            Subject
          </label>
          <input
            id="email-subject"
            required
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            placeholder="Coalition update"
          />
        </div>

        <div>
          <label
            htmlFor="email-body"
            className="mb-1.5 block text-sm font-medium text-neutral-700"
          >
            Message
          </label>
          <textarea
            id="email-body"
            required
            rows={12}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            placeholder={"Write your update here.\n\nBlank lines start a new paragraph."}
          />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4">
          <label
            htmlFor="email-test"
            className="mb-1.5 block text-sm font-medium text-neutral-700"
          >
            Send a test first
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="email-test"
              type="email"
              value={testEmail}
              onChange={(event) => setTestEmail(event.target.value)}
              className="h-11 w-full flex-1 rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              placeholder="you@example.com"
            />
            <Button
              type="button"
              variant="outline"
              disabled={loading || !subject.trim() || !body.trim() || !testEmail.trim()}
              onClick={() => void send({ test: true })}
            >
              Send test
            </Button>
          </div>
        </div>

        {error && (
          <p className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm font-medium text-accent" role="status">
            {success}
          </p>
        )}

        <Button type="submit" disabled={loading || !subject.trim() || !body.trim()}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send to all subscribers
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
