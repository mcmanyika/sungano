"use client";

import { motion } from "framer-motion";
import { ArrowRight, Scale, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { cardSurfaceInteractive } from "@/lib/styles";
import { cn } from "@/lib/utils";

const pillars = [
  {
    icon: Scale,
    title: "Restore Through Justice",
    description:
      "We seek constitutional review through the courts and promote constitutional supremacy. Justice is the lawful foundation upon which democracy is restored and protected for every citizen.",
    cta: "Learn More",
    href: "#rights",
  },
  {
    icon: Users,
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

      <div className="grid gap-6 md:grid-cols-2">
        {pillars.map((pillar, index) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: index * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className={cn(cardSurfaceInteractive, "group p-8 md:p-10")}
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition-colors group-hover:bg-primary/5 group-hover:text-primary">
              <pillar.icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="font-display text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">
              {pillar.title}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              {pillar.description}
            </p>
            <Button href={pillar.href} variant="ghost" className="mt-6 -ml-2 px-3">
              {pillar.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
