"use client";

import { motion } from "framer-motion";
import { timelineEvents } from "@/lib/data";
import { cardSurface } from "@/lib/styles";
import { cn } from "@/lib/utils";

export function Timeline() {
  return (
    <div className="relative mx-auto max-w-3xl">
      <div
        className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-accent/30 to-secondary/20 md:left-1/2 md:-translate-x-px"
        aria-hidden
      />

      <div className="space-y-10">
        {timelineEvents.map((event, index) => {
          const isEven = index % 2 === 0;
          return (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, x: isEven ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative flex items-start gap-6 md:gap-0",
                isEven ? "md:flex-row" : "md:flex-row-reverse",
              )}
            >
              <div className="absolute left-4 z-10 flex -translate-x-1/2 md:left-1/2">
                <div className="h-2.5 w-2.5 rounded-full bg-primary ring-[3px] ring-white" />
              </div>

              <div
                className={cn(
                  "ml-10 w-full md:ml-0 md:w-[calc(50%-1.75rem)]",
                  isEven ? "md:pr-7 md:text-right" : "md:pl-7 md:ml-auto",
                )}
              >
                <div className={cn(cardSurface, "p-5 transition-shadow hover:shadow-[var(--card-shadow-hover)]")}>
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    {event.year}
                  </span>
                  <h3 className="mt-1 font-display text-base font-bold tracking-tight text-neutral-900">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {event.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
