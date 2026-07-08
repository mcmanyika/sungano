"use client";

import { motion } from "framer-motion";
import { timelineEvents } from "@/lib/data";

/** Vertical timeline with scroll-triggered animations */
export function Timeline() {
  return (
    <div className="relative mx-auto max-w-3xl">
      {/* Center line */}
      <div
        className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-accent/40 to-secondary/40 md:left-1/2 md:-translate-x-px"
        aria-hidden
      />

      <div className="space-y-12">
        {timelineEvents.map((event, index) => {
          const isEven = index % 2 === 0;
          return (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, x: isEven ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex items-start gap-6 md:gap-0 ${
                isEven ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Dot */}
              <div className="absolute left-4 z-10 flex h-3 w-3 -translate-x-1/2 items-center justify-center md:left-1/2">
                <div className="h-3 w-3 rounded-full bg-primary ring-4 ring-white dark:ring-neutral-950" />
              </div>

              {/* Content card */}
              <div
                className={`ml-10 w-full md:ml-0 md:w-[calc(50%-2rem)] ${
                  isEven ? "md:pr-8 md:text-right" : "md:pl-8 md:ml-auto"
                }`}
              >
                <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                  <span className="text-sm font-semibold text-secondary">
                    {event.year}
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-neutral-900 dark:text-white">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
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
