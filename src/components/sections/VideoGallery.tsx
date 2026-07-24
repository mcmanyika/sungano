"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { easeOut } from "@/lib/animations";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeToPublishedVideos } from "@/lib/firebase/videos";
import { cardSurface } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { formatVideoDate, type GalleryVideo } from "@/types/video";

const GALLERY_LIMIT = 6;

export function VideoGallery() {
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setError("Videos are not available right now.");
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToPublishedVideos(
      (nextVideos) => {
        setVideos(nextVideos.slice(0, GALLERY_LIMIT));
        setError("");
        setLoading(false);
      },
      () => {
        setError("Unable to load videos.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  if (!loading && !error && videos.length === 0) {
    return null;
  }

  return (
    <Section id="videos" variant="default" className="scroll-mt-28">
      <SectionHeader
        title="Videos"
        description="Watch messages and updates from the Coalition."
      />

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className={cn(cardSurface, "aspect-video animate-pulse rounded-2xl")}
            />
          ))}
        </div>
      ) : error ? (
        <div className={cn(cardSurface, "rounded-2xl p-8 text-center")}>
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video, index) => (
            <motion.article
              key={video.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.08, duration: 0.55, ease: easeOut }}
              className="min-w-0"
            >
              <YouTubeEmbed videoId={video.youtubeId} title={video.title} />
              <div className="mt-4">
                {video.publishedAt && (
                  <p className="text-xs text-muted">
                    {formatVideoDate(video.publishedAt)}
                  </p>
                )}
                <h3 className="mt-1.5 font-display text-lg font-bold tracking-tight text-neutral-900">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                    {video.description}
                  </p>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </Section>
  );
}
