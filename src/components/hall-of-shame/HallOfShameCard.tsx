"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { cardSurfaceInteractive } from "@/lib/styles";
import { cn } from "@/lib/utils";
import {
  ACTOR_TYPE_LABELS,
  formatViolationDate,
  type HallOfShameCase,
} from "@/types/hall-of-shame";

export function HallOfShameCard({
  item,
  href,
}: {
  item: HallOfShameCase;
  href?: string;
}) {
  const to = href ?? `/hall-of-shame/${item.id}`;
  const photo = item.photos.find((entry) => entry.imageUrl);

  return (
    <Link
      href={to}
      className={cn(
        cardSurfaceInteractive,
        "group flex h-full flex-col overflow-hidden rounded-2xl",
      )}
    >
      {photo ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          {formatViolationDate(item.occurredOn)} · {ACTOR_TYPE_LABELS[item.actorType]}
        </p>
        <h3 className="mt-2 font-display text-lg font-bold text-neutral-900 group-hover:text-primary">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-600">
          {item.summary}
        </p>
        <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5" />
          {[item.location, item.province].filter(Boolean).join(", ") || "Location withheld"}
        </p>
        {item.violationTypes.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {item.violationTypes.slice(0, 3).map((type) => (
              <li
                key={type}
                className="rounded-full bg-primary/8 px-2 py-0.5 text-[11px] font-medium text-primary"
              >
                {type}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Link>
  );
}
