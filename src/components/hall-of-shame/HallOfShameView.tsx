"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { HallOfShameCard } from "@/components/hall-of-shame/HallOfShameCard";
import { ReportIncidentForm } from "@/components/hall-of-shame/ReportIncidentForm";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeToPublishedHallOfShame } from "@/lib/firebase/hall-of-shame";
import { cardSurface } from "@/lib/styles";
import { cn } from "@/lib/utils";
import {
  ACTOR_TYPE_LABELS,
  HALL_OF_SHAME_PROVINCES,
  VIOLATION_ACTOR_TYPES,
  VIOLATION_TYPES,
  type HallOfShameCase,
  type ViolationActorType,
  type ViolationType,
} from "@/types/hall-of-shame";

export function HallOfShameView() {
  const [cases, setCases] = useState<HallOfShameCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [province, setProvince] = useState("");
  const [actorType, setActorType] = useState<ViolationActorType | "">("");
  const [violationType, setViolationType] = useState<ViolationType | "">("");

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setError("The Hall of Shame is not available right now.");
      setLoading(false);
      return;
    }

    return subscribeToPublishedHallOfShame(
      (next) => {
        setCases(next);
        setError("");
        setLoading(false);
      },
      () => {
        setError("Unable to load published records.");
        setLoading(false);
      },
    );
  }, []);

  const filtered = useMemo(
    () =>
      cases.filter((item) => {
        if (province && item.province !== province) {
          return false;
        }
        if (actorType && item.actorType !== actorType) {
          return false;
        }
        if (violationType && !item.violationTypes.includes(violationType)) {
          return false;
        }
        return true;
      }),
    [actorType, cases, province, violationType],
  );

  return (
    <>
      <main className="min-h-svh bg-background px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Civic record
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Hall of Shame
          </h1>
          <div className="mt-4 h-1 w-14 rounded-full bg-secondary" aria-hidden />
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted md:text-lg">
            A public record of alleged political violence and intimidation by
            state and private actors. Reports can be submitted anonymously.
            Nothing is published until it is reviewed. These are allegations,
            not court findings.
          </p>

          <div className={`mt-8 grid gap-3 rounded-2xl p-4 sm:grid-cols-3 ${cardSurface}`}>
            <select
              value={province}
              onChange={(event) => setProvince(event.target.value)}
              className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm"
            >
              <option value="">All provinces</option>
              {HALL_OF_SHAME_PROVINCES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={actorType}
              onChange={(event) =>
                setActorType(event.target.value as ViolationActorType | "")
              }
              className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm"
            >
              <option value="">All actors</option>
              {VIOLATION_ACTOR_TYPES.map((item) => (
                <option key={item} value={item}>
                  {ACTOR_TYPE_LABELS[item]}
                </option>
              ))}
            </select>
            <select
              value={violationType}
              onChange={(event) =>
                setViolationType(event.target.value as ViolationType | "")
              }
              className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm"
            >
              <option value="">All violation types</option>
              {VIOLATION_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="mt-10 flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="mt-10 text-sm font-medium text-red-600">{error}</p>
          ) : filtered.length === 0 ? (
            <p className={cn("mt-10 rounded-2xl p-8 text-center text-neutral-700", cardSurface)}>
              No published records match these filters yet.
            </p>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <HallOfShameCard key={item.id} item={item} />
              ))}
            </div>
          )}

          <div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <h2 className="font-display text-2xl font-bold text-neutral-900">
                Add to the record
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                This is civic documentation, not a substitute for police,
                lawyers, or medical care. If you are in immediate danger, get
                to safety first.
              </p>
            </div>
            <ReportIncidentForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
