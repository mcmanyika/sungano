"use client";

import { Loader2, Pencil, Plus, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getAllImages } from "@/lib/firebase/images";
import { cardSurface } from "@/lib/styles";
import { formatImageDate, type GalleryImage } from "@/types/image";

export function ImageList() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setImages(await getAllImages());
    } catch {
      setError("Unable to load images.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadImages();
  }, [loadImages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900">
            Image gallery
          </h2>
          <p className="mt-1 text-sm text-muted">
            Upload and publish images for the homepage gallery.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => loadImages()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button href="/admin/images/new">
            <Plus className="h-4 w-4" />
            New image
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
      ) : images.length === 0 ? (
        <div className={`rounded-2xl p-8 text-center ${cardSurface}`}>
          <p className="text-neutral-700">
            No gallery images yet. Upload your first image.
          </p>
        </div>
      ) : (
        <div className={`overflow-hidden rounded-2xl ${cardSurface}`}>
          <div className="divide-y divide-neutral-200/80">
            {images.map((image) => (
              <div
                key={image.id}
                className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {image.imageUrl ? (
                      <Image
                        src={image.imageUrl}
                        alt={image.alt || image.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          image.published
                            ? "bg-accent/10 text-accent"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {image.published ? "Published" : "Draft"}
                      </span>
                      {image.publishedAt && (
                        <span className="text-xs text-muted">
                          {formatImageDate(image.publishedAt)}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-display text-base font-bold text-neutral-900">
                      {image.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">
                      {image.description || image.alt}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/admin/images/${image.id}/edit`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-primary/20 hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
