"use client";

import { Loader2, Send } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/Button";
import { isEmptyHtml } from "@/lib/email/html-text";
import { getClientAuth } from "@/lib/firebase/client";
import { getAllSubscribers } from "@/lib/firebase/subscribers";
import { getAllVolunteers } from "@/lib/firebase/volunteers";
import { cardSurface } from "@/lib/styles";

interface EmailBroadcastFormProps {
  /** Hide the page heading when embedded in the Emails tabs view. */
  embedded?: boolean;
}

function audienceLabel(input: {
  includeSubscribers: boolean;
  includeVolunteers: boolean;
  count: number | null;
}): string {
  const { includeSubscribers, includeVolunteers, count } = input;
  const suffix = count !== null ? ` (${count})` : "";

  if (includeSubscribers && includeVolunteers) {
    return `subscribers and volunteers${suffix}`;
  }
  if (includeVolunteers) {
    return `volunteers${suffix}`;
  }
  return `subscribers${suffix}`;
}

export function EmailBroadcastForm({ embedded = false }: EmailBroadcastFormProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [includeSubscribers, setIncludeSubscribers] = useState(true);
  const [includeVolunteers, setIncludeVolunteers] = useState(false);
  const [subscriberEmails, setSubscriberEmails] = useState<string[]>([]);
  const [volunteerEmails, setVolunteerEmails] = useState<string[]>([]);
  const [listsReady, setListsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void Promise.all([getAllSubscribers(), getAllVolunteers()])
      .then(([subscribers, volunteers]) => {
        setSubscriberEmails(
          subscribers.map((subscriber) => subscriber.email.trim().toLowerCase()).filter(Boolean),
        );
        setVolunteerEmails(
          volunteers.map((volunteer) => volunteer.email.trim().toLowerCase()).filter(Boolean),
        );
      })
      .catch(() => {
        setSubscriberEmails([]);
        setVolunteerEmails([]);
      })
      .finally(() => setListsReady(true));
  }, []);

  const uniqueCount = useMemo(() => {
    const emails = new Set<string>();
    if (includeSubscribers) {
      for (const email of subscriberEmails) {
        emails.add(email);
      }
    }
    if (includeVolunteers) {
      for (const email of volunteerEmails) {
        emails.add(email);
      }
    }
    return emails.size;
  }, [includeSubscribers, includeVolunteers, subscriberEmails, volunteerEmails]);

  const recipientLabel = audienceLabel({
    includeSubscribers,
    includeVolunteers,
    count: includeSubscribers || includeVolunteers ? uniqueCount : 0,
  });

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
          includeSubscribers,
          includeVolunteers,
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
            ` of ${data.recipients ?? 0} ${recipientLabel.replace(/ \(\d+\)$/, "")}.`,
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

    if (!includeSubscribers && !includeVolunteers) {
      setError("Choose subscribers, volunteers, or both.");
      return;
    }

    if (
      !window.confirm(
        `Send this email to all ${recipientLabel}? Duplicate addresses are only emailed once.`,
      )
    ) {
      return;
    }

    await send({ test: false });
  }

  const sendDisabled =
    loading ||
    !subject.trim() ||
    isEmptyHtml(body) ||
    (!includeSubscribers && !includeVolunteers);

  const description = `Send an update to ${
    includeSubscribers || includeVolunteers ? recipientLabel : "a selected audience"
  }. Duplicate addresses are only emailed once.`;

  return (
    <div className="space-y-6">
      {!embedded && (
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900">
            Email broadcast
          </h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
      )}

      {embedded && <p className="text-sm text-muted">{description}</p>}

      <form
        onSubmit={handleSubmit}
        className={`space-y-5 rounded-2xl p-6 ${cardSurface}`}
      >
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-neutral-700">
            Send to
          </legend>
          <div className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50/80 p-4">
            <label className="flex items-start gap-3 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={includeSubscribers}
                onChange={(event) => setIncludeSubscribers(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary/20"
              />
              <span>
                <span className="font-medium">Stay Informed subscribers</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {listsReady
                    ? `${subscriberEmails.length} on the website list`
                    : "Loading list…"}
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={includeVolunteers}
                onChange={(event) => setIncludeVolunteers(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary/20"
              />
              <span>
                <span className="font-medium">All volunteers</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {listsReady
                    ? `${volunteerEmails.length} registered emails`
                    : "Loading list…"}
                </span>
              </span>
            </label>
            {includeSubscribers && includeVolunteers ? (
              <p className="pt-1 text-xs text-muted">
                {uniqueCount} unique recipients after removing overlaps.
              </p>
            ) : null}
          </div>
        </fieldset>

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
          <RichTextEditor
            id="email-body"
            value={body}
            onChange={setBody}
            placeholder="Write your update here. Use the toolbar for headings, lists, links, and emphasis."
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
              disabled={loading || !subject.trim() || isEmptyHtml(body) || !testEmail.trim()}
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

        <Button type="submit" disabled={sendDisabled}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send to all {audienceLabel({
                includeSubscribers,
                includeVolunteers,
                count: null,
              })}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
