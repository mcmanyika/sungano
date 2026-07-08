"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { usePageLoad } from "@/components/providers/PageLoadProvider";
import { fadeIn } from "@/lib/animations";

/** Top-of-page scroll progress indicator */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const { isReady } = usePageLoad();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate={isReady ? "visible" : "hidden"}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-[60] h-1 origin-left bg-gradient-to-r from-primary via-accent to-secondary"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
