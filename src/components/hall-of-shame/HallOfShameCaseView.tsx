"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeToPublishedHallOfShame } from "@/lib/firebase/hall-of-shame";
import { cardSurface } from "@/lib/styles";
import {
  ACTOR_TYPE_LABELS,
  formatViolationDate,
  type HallOfShameCase,
} from "@/types/hall-of-shame";

export function HallOfShameCaseView({ id }: { id: string }) {
  const [item, setItem] = useState<HallOfShameCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setMissing(true);
      setLoading(false);
      return;
    }

    return subscribeToPublishedHallOfShame((cases) => {
      const match = cases.find((entry) => entry.id === id) ?? null;
      setItem(match);
      setMissing(!match);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  if (missing || !item) {
    return (
      <>
        <main className="min-h-svh px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm text-muted">This record is not published.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="min-h-svh bg-background px-5 py-24 sm:px-8">
        <article className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Hall of Shame
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-neutral-900 sm:text-4xl">
            {item.title}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {formatViolationDate(item.occurredOn)} · {ACTOR_TYPE_LABELS[item.actorType]}
            {item.actorName ? ` · Alleged: ${item.actorName}` : ""}
            {item.province ? ` · ${[item.location, item.province].filter(Boolean).join(", ")}` : ""}
          </p>
          <div className="mt-4 h-1 w-14 rounded-full bg-secondary" aria-hidden />
          <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-neutral-700">
            {item.summary}
          </p>
          {item.photos.filter((photo) => photo.imageUrl).length > 0 ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {item.photos
                .filter((photo) => photo.imageUrl)
                .map((photo) => (
                  <div key={photo.storagePath} className={`overflow-hidden rounded-2xl ${cardSurface}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.imageUrl}
                      alt=""
                      className="w-full object-cover"
                    />
                  </div>
                ))}
            </div>
          ) : null}
          <ul className="mt-6 flex flex-wrap gap-2">
            {item.violationTypes.map((type) => (
              <li
                key={type}
                className="rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-primary"
              >
                {type}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-xs leading-relaxed text-muted">
            This public summary is moderated. It records an allegation of
            political violence or intimidation. It is not a court judgment.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
