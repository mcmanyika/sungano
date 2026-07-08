"use client";

import { motion } from "framer-motion";
import { constitutionalRights } from "@/lib/data";
import { Section, SectionHeader } from "@/components/ui/Section";

export function ConstitutionalRights() {
  return (
    <Section id="rights" variant="default">
      <SectionHeader
        eyebrow="The Constitution"
        title="Constitutional Rights"
        description="Our movement stands firmly on the constitutional rights that protect every citizen's freedom to participate in democracy."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {constitutionalRights.map((right, index) => (
          <motion.div
            key={right.section}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="group rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-primary/40"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              <right.icon className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
              {right.section}
            </span>
            <h3 className="mt-2 font-display text-lg font-bold text-neutral-900 dark:text-white">
              {right.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {right.description}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
