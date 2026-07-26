"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { easeOut } from "@/lib/animations";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeToPublishedImages } from "@/lib/firebase/images";
import type { GalleryImage } from "@/types/image";

const GALLERY_LIMIT = 3;

export function ImageGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setError("Images are not available right now.");
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToPublishedImages(
      (nextImages) => {
        setImages(nextImages.slice(0, GALLERY_LIMIT));
        setError("");
        setLoading(false);
      },
      () => {
        setError("Unable to load images.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!activeImage) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveImage(null);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImage]);

  if (!loading && !error && images.length === 0) {
    return null;
  }

  return (
    <section id="images" className="relative scroll-mt-28 w-full">
      {loading ? (
        <div className="grid grid-cols-2 gap-0 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square animate-pulse bg-neutral-200"
            />
          ))}
        </div>
      ) : error ? (
        <div className="px-5 py-8 text-center sm:px-8">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-0 md:grid-cols-3">
          {images.map((image, index) => (
            <motion.button
              key={image.id}
              type="button"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.04, duration: 0.45, ease: easeOut }}
              onClick={() => setActiveImage(image)}
              className="group relative aspect-square overflow-hidden bg-neutral-100"
              aria-label={image.alt || image.title || "View image"}
            >
              <Image
                src={image.imageUrl}
                alt={image.alt || image.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 50vw, 33vw"
                unoptimized
              />
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {activeImage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-80 flex items-center justify-center bg-neutral-950/80 p-4 backdrop-blur-sm"
            onClick={() => setActiveImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: easeOut }}
              className="relative w-full max-w-5xl overflow-hidden"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={activeImage.alt || activeImage.title || "Image"}
            >
              <button
                type="button"
                onClick={() => setActiveImage(null)}
                className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-sm transition hover:bg-white"
                aria-label="Close image"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative aspect-16/10 w-full bg-neutral-950">
                <Image
                  src={activeImage.imageUrl}
                  alt={activeImage.alt || activeImage.title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  unoptimized
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
