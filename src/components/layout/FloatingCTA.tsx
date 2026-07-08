"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useScrollPosition } from "@/hooks/useScrollPosition";

/** Floating CTA button visible after scrolling past hero */
export function FloatingCTA() {
  const scrollY = useScrollPosition();
  const visible = scrollY > 600;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3"
        >
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="rounded-full border border-neutral-200 bg-white p-3 shadow-lg transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5 text-primary" />
          </button>
          <Button href="#involved" size="md" className="shadow-2xl">
            Join Movement
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
