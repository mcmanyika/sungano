"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  className?: string;
  variant?: "default" | "hero";
}

export function YouTubeEmbed({
  videoId,
  title,
  className,
  variant = "default",
}: YouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false);
  const thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const isHero = variant === "hero";

  if (!videoId) {
    return null;
  }

  if (playing) {
    return (
      <div
        className={cn(
          "relative aspect-video overflow-hidden",
          isHero ? "rounded-2xl" : "rounded-2xl shadow-xl",
          className,
        )}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className={cn(
        "group relative aspect-video w-full overflow-hidden",
        isHero ? "rounded-2xl outline-none" : "rounded-2xl shadow-xl ring-1 ring-neutral-200/80",
        className,
      )}
      aria-label={`Play video: ${title}`}
    >
      <Image
        src={thumbnail}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 42vw"
        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <div
        className={cn(
          "absolute inset-0",
          isHero
            ? "bg-gradient-to-t from-[#0a2d6b]/85 via-[#0F3D91]/30 to-black/10"
            : "bg-gradient-to-t from-primary-dark/70 via-primary/25 to-transparent",
        )}
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "flex items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110",
            isHero
              ? "h-16 w-16 bg-white/15 text-white backdrop-blur-md sm:h-[4.5rem] sm:w-[4.5rem]"
              : "h-16 w-16 bg-white/95 text-primary sm:h-20 sm:w-20",
          )}
        >
          <Play
            className={cn(
              "ml-0.5",
              isHero ? "h-7 w-7 fill-white sm:h-8 sm:w-8" : "h-7 w-7 fill-primary sm:h-8 sm:w-8",
            )}
            aria-hidden
          />
        </span>
      </span>
      {isHero && (
        <span className="absolute bottom-4 left-4 right-4 text-left">
          <span className="inline-flex rounded-full bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
            Watch welcome message
          </span>
        </span>
      )}
    </button>
  );
}
