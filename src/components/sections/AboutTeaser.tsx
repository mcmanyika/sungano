"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { aboutContent } from "@/lib/about";
import { easeOut } from "@/lib/animations";

export function AboutTeaser() {
  return (
    <Section id="about" variant="default">
      <SectionHeader
        eyebrow={aboutContent.translation}
        title="Who We Are"
        description={aboutContent.whoWeAre.lead}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.55, ease: easeOut }}
        className="mx-auto max-w-3xl"
      >
        <p className="text-center text-base leading-relaxed text-muted md:text-lg">
          {aboutContent.whoWeAre.body}
        </p>

        <div className="mt-10">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Founding Member Institutions
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {aboutContent.foundingMembers.map((member) => (
              <li
                key={member.name}
                className="border-t border-primary/10 pt-3 text-sm font-medium text-neutral-800"
              >
                {member.href ? (
                  <a
                    href={member.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-primary"
                  >
                    {member.name}
                  </a>
                ) : (
                  member.name
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex justify-center">
          <Button href="/about" size="lg">
            Learn more about the Coalition
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </Section>
  );
}
