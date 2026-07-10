"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import {
  getWelcomeVideo,
  saveWelcomeVideo,
} from "@/lib/firebase/welcome-video";
import { cardSurface } from "@/lib/styles";
import {
  DEFAULT_WELCOME_VIDEO,
  parseYouTubeId,
  type WelcomeVideoInput,
} from "@/types/welcome-video";

export function WelcomeVideoForm() {
  const [form, setForm] = useState<WelcomeVideoInput>(DEFAULT_WELCOME_VIDEO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const previewId = parseYouTubeId(form.youtubeId);

  useEffect(() => {
    async function loadVideo() {
      setLoading(true);
      setError("");

      try {
        const video = await getWelcomeVideo();
        setForm({
          title: video.title,
          description: video.description,
          youtubeId: video.youtubeId,
          published: video.published,
        });
      } catch {
        setError("Unable to load the welcome video.");
      } finally {
        setLoading(false);
      }
    }

    void loadVideo();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const youtubeId = parseYouTubeId(form.youtubeId);

    if (form.published && !youtubeId) {
      setError("Add a YouTube video ID or URL before publishing.");
      setSaving(false);
      return;
    }

    try {
      await saveWelcomeVideo({ ...form, youtubeId });
      setForm((current) => ({ ...current, youtubeId }));
      setSuccess(form.published ? "Welcome video published." : "Welcome video saved as draft.");
    } catch {
      setError("Unable to save the video. Check your admin permissions.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className={`space-y-6 p-6 ${cardSurface} rounded-2xl`}>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Title
          </label>
          <input
            required
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Welcome to Sungano Yevanhu"
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Description
          </label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="A short welcome message shown beside the video on the homepage."
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            YouTube video
          </label>
          <input
            value={form.youtubeId}
            onChange={(event) =>
              setForm((current) => ({ ...current, youtubeId: event.target.value }))
            }
            placeholder="https://www.youtube.com/watch?v=... or video ID"
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
          <p className="mt-2 text-xs text-muted">
            Paste a YouTube link or the video ID. The welcome section appears on the
            homepage when published.
          </p>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(event) =>
              setForm((current) => ({ ...current, published: event.target.checked }))
            }
            className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary/20"
          />
          <span className="text-sm font-medium text-neutral-700">
            Publish on homepage
          </span>
        </label>

        {error && (
          <p className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm font-medium text-accent" role="status">
            {success}
          </p>
        )}

        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving
            </>
          ) : form.published ? (
            "Publish video"
          ) : (
            "Save draft"
          )}
        </Button>
      </form>

      {previewId && (
        <div className={`p-6 ${cardSurface} rounded-2xl`}>
          <h3 className="mb-4 text-sm font-semibold text-neutral-900">Preview</h3>
          <YouTubeEmbed videoId={previewId} title={form.title} />
        </div>
      )}
    </div>
  );
}
