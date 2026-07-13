"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EventForm } from "@/components/admin/EventForm";
import { deleteEvent, getEvent } from "@/lib/firebase/events";
import type { EventItem } from "@/types/event";

export default function AdminEditEventPage() {
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      setError("");

      try {
        const nextEvent = await getEvent(params.id);

        if (!nextEvent) {
          setError("Event not found.");
          return;
        }

        setEvent(nextEvent);
      } catch {
        setError("Unable to load this event.");
      } finally {
        setLoading(false);
      }
    }

    void loadEvent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <p className="text-sm font-medium text-red-600" role="alert">
        {error || "Event not found."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          Edit event
        </h2>
        <p className="mt-1 text-sm text-muted">{event.title}</p>
      </div>
      <EventForm event={event} onDelete={() => deleteEvent(event.id)} />
    </div>
  );
}
