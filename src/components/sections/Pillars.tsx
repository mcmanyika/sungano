"use client";

import { motion } from "framer-motion";
import { ArrowRight, Scale, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";

const pillars = [
  {
    icon: Scale,
    emoji: "⚖",
    title: "Restore Through Justice",
    description:
      "We seek constitutional review through the courts and promote constitutional supremacy. Justice is the lawful foundation upon which democracy is restored and protected for every citizen.",
    cta: "Learn More",
    href: "#rights",
  },
  {
    icon: Users,
    emoji: "🤝",
    title: "Restore Through the People",
    description:
      "Through civic education, peaceful engagement, dialogue, petitions, prayer gatherings and lawful demonstrations, we empower citizens to participate in shaping our constitutional future.",
    cta: "Get Involved",
    href: "#contact",
  },
];

export function Pillars() {
  return (
    <Section id="pillars" variant="muted">
      <SectionHeader
        eyebrow="Our Approach"
        title="Two Pillars of Restoration"
        description="Constitutional democracy is restored through the courts and through the people—working together, peacefully and lawfully."
      />

      <div className="grid gap-8 md:grid-cols-2">
        {pillars.map((pillar, index) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            whileHover={{ y: -8 }}
            className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 p-8 shadow-xl backdrop-blur-xl transition-shadow hover:shadow-2xl dark:border-neutral-700/60 dark:bg-neutral-900/40"
          >
            <div className="relative">
              <div className="mb-6 flex items-center gap-4">
                <span className="text-3xl" aria-hidden>
                  {pillar.emoji}
                </span>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 shadow-md dark:bg-neutral-800 dark:text-neutral-400">
                  <pillar.icon className="h-7 w-7" />
                </div>
              </div>
              <h3 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">
                {pillar.title}
              </h3>
              <p className="mt-4 leading-relaxed text-neutral-600 dark:text-neutral-400">
                {pillar.description}
              </p>
              <Button
                href={pillar.href}
                variant="ghost"
                className="mt-6 px-0"
              >
                {pillar.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
