"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { testimonials } from "@/lib/data";
import { cn } from "@/lib/utils";

/** Auto-advancing testimonial carousel with manual controls */
export function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = useCallback((dir: number) => {
    setDirection(dir);
    setIndex((prev) => (prev + dir + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 6000);
    return () => clearInterval(timer);
  }, [paginate]);

  const current = testimonials[index];

  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-8 shadow-xl md:p-12 dark:border-neutral-800 dark:bg-neutral-900">
        <Quote className="mb-6 h-10 w-10 text-secondary/60" aria-hidden />

        <div className="relative min-h-[200px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
              transition={{ duration: 0.4 }}
            >
              <blockquote className="font-display text-xl leading-relaxed text-neutral-800 md:text-2xl dark:text-neutral-100">
                &ldquo;{current.quote}&rdquo;
              </blockquote>
              <footer className="mt-8">
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {current.author}
                </p>
                <p className="text-sm text-neutral-500">{current.role}</p>
                <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/20">
                  {current.category}
                </span>
              </footer>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-2" role="tablist" aria-label="Testimonials">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index
                    ? "w-8 bg-primary"
                    : "w-2 bg-neutral-300 dark:bg-neutral-700",
                )}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => paginate(-1)}
              className="rounded-full border border-neutral-200 p-2 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => paginate(1)}
              className="rounded-full border border-neutral-200 p-2 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
