"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  MapPin,
  RefreshCw,
  Reply,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { easeOut } from "@/lib/animations";
import { getClientAuth } from "@/lib/firebase/client";
import { deleteVolunteer, getAllVolunteers } from "@/lib/firebase/volunteers";
import { cardSurface } from "@/lib/styles";
import { siteConfig } from "@/lib/data";
import { formatVolunteerDate, type Volunteer } from "@/types/volunteer";

export function VolunteerList() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Volunteer | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState("");

  const loadVolunteers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setVolunteers(await getAllVolunteers());
    } catch {
      setError("Unable to load volunteer registrations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVolunteers();
  }, [loadVolunteers]);

  const resetReplyState = useCallback(() => {
    setReplyOpen(false);
    setReplySubject("");
    setReplyBody("");
    setReplyError("");
    setReplySuccess("");
  }, []);

  const closeDetail = useCallback(() => {
    resetReplyState();
    setSelected(null);
  }, [resetReplyState]);

  useEffect(() => {
    if (!selected) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDetail();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selected, closeDetail]);

  function openDetail(volunteer: Volunteer) {
    resetReplyState();
    setSelected(volunteer);
  }

  function openReply() {
    if (!selected) {
      return;
    }

    setReplyOpen(true);
    setReplyError("");
    setReplySuccess("");
    setReplySubject(`Re: Your registration with ${siteConfig.shortName}`);
    setReplyBody(
      selected.message?.trim()
        ? `Thank you for writing to us.\n\n`
        : `Thank you for registering your interest with ${siteConfig.shortName}.\n\n`,
    );
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

      const token = await user.getIdToken();
      const response = await fetch("/api/email/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: selected.email,
          recipientName: selected.fullName,
          subject: replySubject,
          body: replyBody,
          originalMessage: selected.message,
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

      setReplySuccess(`Reply sent to ${selected.email}.`);
      setReplyOpen(false);
    } catch {
      setReplyError("Network error. Please try again.");
    } finally {
      setReplySending(false);
    }
  }

  const filteredVolunteers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return volunteers;
    }

    return volunteers.filter((volunteer) =>
      [
        volunteer.fullName,
        volunteer.email,
        volunteer.phone,
        volunteer.province,
        volunteer.interest,
        volunteer.message,
        volunteer.source,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search, volunteers]);

  const provinceCounts = useMemo(() => {
    return volunteers.reduce<Record<string, number>>((counts, volunteer) => {
      counts[volunteer.province] = (counts[volunteer.province] ?? 0) + 1;
      return counts;
    }, {});
  }, [volunteers]);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this volunteer registration?")) {
      return;
    }

    setDeletingId(id);
    setError("");

    try {
      await deleteVolunteer(id);
      setVolunteers((current) =>
        current.filter((volunteer) => volunteer.id !== id),
      );
      if (selected?.id === id) {
        closeDetail();
      }
    } catch {
      setError("Unable to delete this registration.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900">
            Volunteers
          </h2>
          <p className="mt-1 text-sm text-muted">
            Registrations submitted from the website volunteer form.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => loadVolunteers()}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className={`rounded-2xl p-5 ${cardSurface}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-muted">Total volunteers</p>
              <p className="font-display text-2xl font-bold text-neutral-900">
                {volunteers.length}
              </p>
            </div>
          </div>
        </div>

        {Object.entries(provinceCounts)
          .slice(0, 5)
          .map(([province, count]) => (
            <div key={province} className={`rounded-2xl p-5 ${cardSurface}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-muted">{province}</p>
                  <p className="font-display text-2xl font-bold text-neutral-900">
                    {count}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className={`rounded-2xl p-4 ${cardSurface}`}>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, email, phone, province, or interest..."
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
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
      ) : filteredVolunteers.length === 0 ? (
        <div className={`rounded-2xl p-8 text-center ${cardSurface}`}>
          <UserPlus className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-neutral-700">
            {search
              ? "No volunteers match your search."
              : "No volunteer registrations yet."}
          </p>
        </div>
      ) : (
        <div className={`overflow-hidden rounded-2xl ${cardSurface}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200/80 bg-neutral-50/80 text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Province</th>
                  <th className="px-5 py-3">Interest</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Registered</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80">
                {filteredVolunteers.map((volunteer) => (
                  <tr
                    key={volunteer.id}
                    className="cursor-pointer align-top text-neutral-700 transition hover:bg-primary/3"
                    onClick={() => openDetail(volunteer)}
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-neutral-900">
                        {volunteer.fullName}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p>{volunteer.email}</p>
                      <p className="mt-1 text-muted">{volunteer.phone}</p>
                    </td>
                    <td className="px-5 py-4">{volunteer.province}</td>
                    <td className="px-5 py-4">{volunteer.interest}</td>
                    <td className="px-5 py-4 capitalize text-muted">
                      {volunteer.source}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {formatVolunteerDate(volunteer.registeredAt)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDelete(volunteer.id);
                        }}
                        disabled={deletingId === volunteer.id}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        aria-label={`Delete ${volunteer.fullName}`}
                      >
                        {deletingId === volunteer.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <div
            className="fixed inset-0 z-120 flex items-center justify-center px-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="volunteer-detail-title"
          >
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-primary-dark/45 backdrop-blur-[2px]"
              aria-label="Close registration details"
              onClick={closeDetail}
            />

            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Registration
                  </p>
                  <h3
                    id="volunteer-detail-title"
                    className="mt-1 font-display text-2xl font-bold text-neutral-900"
                  >
                    {selected.fullName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeDetail}
                  className="rounded-full border border-neutral-200 p-2 text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-900"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-800">
                    {selected.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Phone
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-800">
                    {selected.phone}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Province
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-800">
                    {selected.province}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Interest
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-800">
                    {selected.interest}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Source
                  </dt>
                  <dd className="mt-1 text-sm capitalize text-neutral-800">
                    {selected.source}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Registered
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-800">
                    {formatVolunteerDate(selected.registeredAt)}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-neutral-200/80 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Message
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                  {selected.message?.trim()
                    ? selected.message
                    : "No message provided."}
                </p>
              </div>

              {replySuccess && (
                <p className="mt-4 text-sm font-medium text-accent" role="status">
                  {replySuccess}
                </p>
              )}

              {replyOpen ? (
                <div className="mt-6 space-y-4 border-t border-neutral-200/80 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Reply to {selected.email}
                  </p>
                  <div>
                    <label
                      htmlFor="volunteer-reply-subject"
                      className="mb-1.5 block text-sm font-medium text-neutral-700"
                    >
                      Subject
                    </label>
                    <input
                      id="volunteer-reply-subject"
                      value={replySubject}
                      onChange={(event) => setReplySubject(event.target.value)}
                      className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="volunteer-reply-body"
                      className="mb-1.5 block text-sm font-medium text-neutral-700"
                    >
                      Message
                    </label>
                    <textarea
                      id="volunteer-reply-body"
                      rows={7}
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
                  <div className="flex flex-wrap justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setReplyOpen(false);
                        setReplyError("");
                      }}
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
              ) : (
                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <Button type="button" variant="outline" onClick={closeDetail}>
                    Close
                  </Button>
                  <Button type="button" onClick={openReply}>
                    <Reply className="h-4 w-4" />
                    Reply by email
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    onClick={() => void handleDelete(selected.id)}
                    disabled={deletingId === selected.id}
                  >
                    {deletingId === selected.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
