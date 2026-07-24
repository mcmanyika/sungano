"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { VideoForm } from "@/components/admin/VideoForm";
import { deleteVideo, getVideo } from "@/lib/firebase/videos";
import type { GalleryVideo } from "@/types/video";

export default function AdminEditVideoPage() {
  const params = useParams<{ id: string }>();
  const [video, setVideo] = useState<GalleryVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVideo() {
      setLoading(true);
      setError("");

      try {
        const nextVideo = await getVideo(params.id);

        if (!nextVideo) {
          setError("Video not found.");
          return;
        }

        setVideo(nextVideo);
      } catch {
        setError("Unable to load this video.");
      } finally {
        setLoading(false);
      }
    }

    void loadVideo();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!video) {
    return (
      <p className="text-sm font-medium text-red-600" role="alert">
        {error || "Video not found."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          Edit video
        </h2>
        <p className="mt-1 text-sm text-muted">{video.title}</p>
      </div>
      <VideoForm video={video} onDelete={() => deleteVideo(video.id)} />
    </div>
  );
}
