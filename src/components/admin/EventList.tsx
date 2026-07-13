"use client";

import { Loader2, Pencil, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getAllEvents } from "@/lib/firebase/events";
import { cardSurface } from "@/lib/styles";
import { formatEventDateTime, type EventItem } from "@/types/event";

export function EventList() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setEvents(await getAllEvents());
    } catch {
      setError("Unable to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900">
            Events
          </h2>
          <p className="mt-1 text-sm text-muted">
            Create and publish events for the homepage.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => loadEvents()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button href="/admin/events/new">
            <Plus className="h-4 w-4" />
            New event
          </Button>
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
      ) : events.length === 0 ? (
        <div className={`rounded-2xl p-8 text-center ${cardSurface}`}>
          <p className="text-neutral-700">No events yet. Create your first event.</p>
        </div>
      ) : (
        <div className={`overflow-hidden rounded-2xl ${cardSurface}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200/80 bg-neutral-50/80 text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Starts</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80">
                {events.map((event) => (
                  <tr key={event.id} className="text-neutral-700">
                    <td className="px-5 py-4 font-medium text-neutral-900">
                      {event.title}
                    </td>
                    <td className="px-5 py-4">{event.location}</td>
                    <td className="px-5 py-4 text-muted">
                      {formatEventDateTime(event.startAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          event.published
                            ? "rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent"
                            : "rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-muted"
                        }
                      >
                        {event.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
