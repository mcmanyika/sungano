"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ImageForm } from "@/components/admin/ImageForm";
import { deleteImage, getImage } from "@/lib/firebase/images";
import type { GalleryImage } from "@/types/image";

export default function AdminEditImagePage() {
  const params = useParams<{ id: string }>();
  const [image, setImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadImage() {
      setLoading(true);
      setError("");

      try {
        const nextImage = await getImage(params.id);

        if (!nextImage) {
          setError("Image not found.");
          return;
        }

        setImage(nextImage);
      } catch {
        setError("Unable to load this image.");
      } finally {
        setLoading(false);
      }
    }

    void loadImage();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!image) {
    return (
      <p className="text-sm font-medium text-red-600" role="alert">
        {error || "Image not found."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          Edit image
        </h2>
        <p className="mt-1 text-sm text-muted">{image.title}</p>
      </div>
      <ImageForm image={image} onDelete={() => deleteImage(image.id)} />
    </div>
  );
}
