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
        title="Constitutional Rights"
        description="Our movement stands firmly on the constitutional rights that protect every citizen's freedom to participate in democracy."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {constitutionalRights.map((right, index) => (
          <motion.div
            key={right.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            className={cn(cardSurfaceInteractive, "group p-6")}
          >
            <h3 className="font-display text-base font-bold tracking-tight text-neutral-900">
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
