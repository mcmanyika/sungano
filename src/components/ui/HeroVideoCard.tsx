"use client";

import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import type { WelcomeVideo } from "@/types/welcome-video";

interface HeroVideoCardProps {
  video: WelcomeVideo;
}

export function HeroVideoCard({ video }: HeroVideoCardProps) {
  if (!video.youtubeId) {
    return null;
  }

  return (
    <div className="relative w-full min-w-0">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-secondary/30 via-white/5 to-accent/20 opacity-70 blur-3xl"
      />
      <YouTubeEmbed
        videoId={video.youtubeId}
        title={video.title}
        variant="hero"
      />
    </div>
  );
}
