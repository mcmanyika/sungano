"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { easeOut } from "@/lib/animations";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeToPublishedVideos } from "@/lib/firebase/videos";
import { cardSurface } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { formatVideoDate, type GalleryVideo } from "@/types/video";

interface VideoGalleryModalProps {
  open: boolean;
  onClose: () => void;
}

export function VideoGalleryModal({ open, onClose }: VideoGalleryModalProps) {
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!isFirebaseConfigured()) {
      setError("Videos are not available right now.");
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToPublishedVideos(
      (nextVideos) => {
        setVideos(nextVideos);
        setError("");
        setLoading(false);
      },
      () => {
        setError("Unable to load videos.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-80 bg-neutral-950/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="absolute inset-0 flex flex-col bg-white"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Videos"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-5 py-4 sm:px-8">
              <h2 className="font-display text-xl font-bold text-neutral-900 sm:text-2xl">
                Videos
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-primary/20 hover:text-primary"
                aria-label="Close videos"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className={cn(cardSurface, "rounded-2xl p-8 text-center")}>
                  <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
              ) : videos.length === 0 ? (
                <div className={cn(cardSurface, "rounded-2xl p-8 text-center")}>
                  <p className="text-sm text-muted">No videos published yet.</p>
                </div>
              ) : (
                <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {videos.map((video) => (
                    <article key={video.id} className="min-w-0">
                      <YouTubeEmbed
                        videoId={video.youtubeId}
                        title={video.title}
                      />
                      <div className="mt-4">
                        {video.publishedAt ? (
                          <p className="text-xs text-muted">
                            {formatVideoDate(video.publishedAt)}
                          </p>
                        ) : null}
                        <h3 className="mt-1.5 font-display text-lg font-bold tracking-tight text-neutral-900">
                          {video.title}
                        </h3>
                        {video.description ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                            {video.description}
                          </p>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function isVideosFooterLink(link: { id: string; href: string; label: string }) {
  const href = link.href.replace(/^\//, "").toLowerCase();
  return (
    link.id === "footer-videos" ||
    href === "#videos" ||
    link.label.trim().toLowerCase() === "videos"
  );
}
