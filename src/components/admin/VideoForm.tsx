"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { createVideo, updateVideo } from "@/lib/firebase/videos";
import { cardSurface } from "@/lib/styles";
import {
  parseYouTubeId,
  type GalleryVideo,
  type GalleryVideoInput,
} from "@/types/video";

interface VideoFormProps {
  video?: GalleryVideo;
  onDelete?: () => Promise<void>;
}

function toInput(video?: GalleryVideo): GalleryVideoInput {
  return {
    title: video?.title ?? "",
    description: video?.description ?? "",
    youtubeId: video?.youtubeId ?? "",
    published: video?.published ?? false,
    publishedAt: video?.publishedAt ?? null,
  };
}

export function VideoForm({ video, onDelete }: VideoFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<GalleryVideoInput>(() => toInput(video));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isEditing = Boolean(video);
  const previewId = parseYouTubeId(form.youtubeId);

  function updateField<K extends keyof GalleryVideoInput>(
    key: K,
    value: GalleryVideoInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const youtubeId = parseYouTubeId(form.youtubeId);

    if (!youtubeId) {
      setError("Enter a valid YouTube URL or video ID.");
      setLoading(false);
      return;
    }

    try {
      const payload = { ...form, youtubeId };

      if (isEditing && video) {
        await updateVideo(video.id, payload);
      } else {
        await createVideo(payload);
      }

      router.push("/admin/videos");
      router.refresh();
    } catch {
      setError("Unable to save this video. Check your admin permissions.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!onDelete || !window.confirm("Delete this video permanently?")) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await onDelete();
      router.push("/admin/videos");
      router.refresh();
    } catch {
      setError("Unable to delete this video.");
      setDeleting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-6 rounded-2xl p-6 ${cardSurface}`}
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Title
        </label>
        <input
          required
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          placeholder="Video title"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          rows={3}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          placeholder="Short description shown in the gallery"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          YouTube URL or video ID
        </label>
        <input
          required
          value={form.youtubeId}
          onChange={(event) => updateField("youtubeId", event.target.value)}
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          placeholder="https://www.youtube.com/watch?v=... or video ID"
        />
      </div>

      {previewId && (
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700">Preview</p>
          <YouTubeEmbed videoId={previewId} title={form.title || "Preview"} />
        </div>
      )}

      <label className="flex items-center gap-3 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(event) => {
            const published = event.target.checked;
            updateField("published", published);
            if (published && !form.publishedAt) {
              updateField("publishedAt", new Date());
            }
          }}
          className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary/20"
        />
        Published (visible in gallery)
      </label>

      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEditing ? "Save changes" : "Create video"}
        </Button>
        <Button href="/admin/videos" variant="outline" type="button">
          Cancel
        </Button>
        {onDelete && (
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="ml-auto border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
