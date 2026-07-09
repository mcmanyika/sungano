"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";

export function Mission() {
  return (
    <Section id="mission" variant="default">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-4xl text-center"
      >
        <div className="absolute -top-8 left-1/2 h-px w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="flex justify-center">
          <span className="eyebrow-pill">Our Mission</span>
        </div>
        <h2 className="mt-6 font-display text-3xl font-bold leading-[1.2] tracking-tight text-neutral-900 sm:text-4xl md:text-5xl lg:text-[3.25rem]">
          To peacefully restore constitutional supremacy and strengthen democratic
          governance through justice, civic participation and respect for the rule
          of law.
        </h2>
      </motion.div>
    </Section>
  );
}
