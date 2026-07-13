"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeToPublishedEvents } from "@/lib/firebase/events";
import { cardSurfaceInteractive } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/animations";
import {
  formatEventDate,
  formatEventTime,
  type EventItem,
} from "@/types/event";

export function UpcomingEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setError("Events are not available right now.");
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToPublishedEvents(
      (nextEvents) => {
        setEvents(nextEvents);
        setError("");
        setLoading(false);
      },
      () => {
        setError("Unable to load events.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return (
    <Section id="events" variant="default">
      <SectionHeader
        title="Upcoming Events"
        description="Gatherings, dialogues, and civic actions across the country."
      />

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className={cn(cardSurfaceInteractive, "h-44 animate-pulse rounded-2xl")}
            />
          ))}
        </div>
      ) : error ? (
        <div className={cn(cardSurfaceInteractive, "rounded-2xl p-8 text-center")}>
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className={cn(cardSurfaceInteractive, "rounded-2xl p-8 text-center")}>
          <p className="text-neutral-700">No upcoming events published yet.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <motion.article
              key={event.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.08, duration: 0.55, ease: easeOut }}
              className={cn(cardSurfaceInteractive, "rounded-2xl p-6")}
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatEventDate(event.startAt)}
                </span>
                {formatEventTime(event.startAt) && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {formatEventTime(event.startAt)}
                    {event.endAt && formatEventTime(event.endAt)
                      ? ` – ${formatEventTime(event.endAt)}`
                      : ""}
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-neutral-900">
                {event.title}
              </h3>
              <p className="mt-2 flex items-start gap-1.5 text-sm text-primary">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {event.location}
              </p>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                {event.description}
              </p>
            </motion.article>
          ))}
        </div>
      )}
    </Section>
  );
}
