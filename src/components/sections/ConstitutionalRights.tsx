"use client";

import { motion } from "framer-motion";
import { constitutionalRights } from "@/lib/data";
import { Section, SectionHeader } from "@/components/ui/Section";
import { cardSurfaceInteractive } from "@/lib/styles";
import { cn } from "@/lib/utils";

export function ConstitutionalRights() {
  return (
    <Section id="rights" variant="default">
      <SectionHeader
        eyebrow="The Constitution"
        title="Constitutional Rights"
        description="Our movement stands firmly on the constitutional rights that protect every citizen's freedom to participate in democracy."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {constitutionalRights.map((right, index) => (
          <motion.div
            key={right.section}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            className={cn(cardSurfaceInteractive, "group p-6")}
          >
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition-colors group-hover:bg-primary/5 group-hover:text-primary">
              <right.icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary">
              {right.section}
            </span>
            <h3 className="mt-2 font-display text-base font-bold tracking-tight text-neutral-900">
              {right.title}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted">
              {right.description}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
