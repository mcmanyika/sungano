"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}

/** Animated number counter triggered on scroll into view */
export function AnimatedCounter({
  value,
  suffix = "",
  className,
  duration = 2,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const hasAnimated = useRef(false);

  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (v) => Math.floor(v).toLocaleString());

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}
