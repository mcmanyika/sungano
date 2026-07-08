"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";

export function Mission() {
  return (
    <Section id="mission" variant="default">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-4xl text-center"
      >
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">
          Our Mission
        </p>
        <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
          To peacefully restore constitutional supremacy and strengthen democratic
          governance through justice, civic participation and respect for the rule
          of law.
        </h2>
      </motion.div>
    </Section>
  );
}
