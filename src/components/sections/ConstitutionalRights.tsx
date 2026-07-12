"use client";

import { motion } from "framer-motion";
import { constitutionalRights } from "@/lib/data";
import { Section, SectionHeader } from "@/components/ui/Section";
import { easeOut } from "@/lib/animations";

export function ConstitutionalRights() {
  return (
    <Section id="rights" variant="default">
      <SectionHeader
        title="Constitutional Rights"
        description="Our movement stands firmly on the constitutional rights that protect every citizen's freedom to participate in democracy."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {constitutionalRights.map((right, index) => (
          <motion.div
            key={right.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.08, duration: 0.55, ease: easeOut }}
            className="group relative border-t border-primary/15 pt-6 transition-colors hover:border-secondary"
          >
            <span className="font-display text-xs font-semibold tracking-[0.18em] text-secondary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-neutral-900 transition-colors group-hover:text-primary">
              {right.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {right.description}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
