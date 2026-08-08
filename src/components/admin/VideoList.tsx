"use client";

import { Loader2, Pencil, Plus, RefreshCw, Star } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  clearHeroVideo,
  getAllVideos,
  setHeroVideo,
} from "@/lib/firebase/videos";
import { cardSurface } from "@/lib/styles";
import { formatVideoDate, type GalleryVideo } from "@/types/video";

export function VideoList() {
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [heroUpdatingId, setHeroUpdatingId] = useState<string | null>(null);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setVideos(await getAllVideos());
    } catch {
      setError("Unable to load videos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVideos();
  }, [loadVideos]);

  async function handleHeroToggle(video: GalleryVideo) {
    setHeroUpdatingId(video.id);
    setError("");

    try {
      if (video.isHero) {
        await clearHeroVideo(video.id);
      } else {
        await setHeroVideo(video.id);
      }
      await loadVideos();
    } catch {
      setError("Unable to update the hero video.");
    } finally {
      setHeroUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900">
            Video gallery
          </h2>
          <p className="mt-1 text-sm text-muted">
            Publish YouTube videos for the homepage gallery. Mark one as the
            hero video for the Who We Are section.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => loadVideos()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button href="/admin/videos/new">
            <Plus className="h-4 w-4" />
            New video
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
      ) : videos.length === 0 ? (
        <div className={`rounded-2xl p-8 text-center ${cardSurface}`}>
          <p className="text-neutral-700">
            No gallery videos yet. Add your first YouTube video.
          </p>
        </div>
      ) : (
        <div className={`overflow-hidden rounded-2xl ${cardSurface}`}>
          <div className="divide-y divide-neutral-200/80">
            {videos.map((video) => (
              <div
                key={video.id}
                className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        video.published
                          ? "bg-accent/10 text-accent"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {video.published ? "Published" : "Draft"}
                    </span>
                    {video.isHero ? (
                      <span className="rounded-full bg-secondary/15 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-800">
                        Hero
                      </span>
                    ) : null}
                    {video.publishedAt && (
                      <span className="text-xs text-muted">
                        {formatVideoDate(video.publishedAt)}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-display text-base font-bold text-neutral-900">
                    {video.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {video.description || video.youtubeId}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleHeroToggle(video)}
                    disabled={heroUpdatingId === video.id}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
                      video.isHero
                        ? "border-secondary/40 bg-secondary/10 text-neutral-900 hover:bg-secondary/20"
                        : "border-neutral-200 text-neutral-700 hover:border-primary/20 hover:text-primary"
                    }`}
                  >
                    {heroUpdatingId === video.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Star
                        className={`h-4 w-4 ${video.isHero ? "fill-secondary text-secondary" : ""}`}
                      />
                    )}
                    {video.isHero ? "Unset hero" : "Set as hero"}
                  </button>
                  <Link
                    href={`/admin/videos/${video.id}/edit`}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-primary/20 hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
