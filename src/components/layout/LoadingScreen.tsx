"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { easeOut } from "@/lib/animations";
import { siteConfig } from "@/lib/data";

interface LoadingScreenProps {
  onComplete: () => void;
}

/** Elegant page load splash — reveals main content on exit */
export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence
      onExitComplete={onComplete}
      mode="wait"
    >
      {loading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-neutral-950"
          aria-hidden={!loading}
          aria-live="polite"
          aria-label="Loading"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            <Image
              src="/images/logo.jpeg"
              alt={siteConfig.name}
              width={200}
              height={80}
              className="h-20 w-auto object-contain"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 140, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.25, ease: easeOut }}
            className="mt-6 h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.1, delay: 0.3, ease: easeOut }}
              className="h-full w-full bg-gradient-to-r from-primary via-accent to-secondary"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5, ease: easeOut }}
            className="mt-4 max-w-xs text-center font-display text-sm font-semibold uppercase tracking-[0.12em] text-neutral-700"
          >
            {siteConfig.name.toUpperCase()}
            <span className="mx-2 text-neutral-300">/</span>
            {siteConfig.eyebrow}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
