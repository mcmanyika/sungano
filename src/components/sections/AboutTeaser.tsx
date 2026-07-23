"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { aboutContent } from "@/lib/about";
import { easeOut } from "@/lib/animations";

function memberParts(name: string) {
  const match = name.match(/^(.*?)\s*\(([^)]+)\)\s*$/);

  if (!match) {
    return { label: name, acronym: null as string | null };
  }

  return { label: match[1], acronym: match[2] };
}

export function AboutTeaser() {
  return (
    <Section id="about" variant="muted" className="overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

      <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 xl:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: easeOut }}
        >
          <h2 className="font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
            Who We Are
          </h2>
          <div className="mt-5 h-px w-12 bg-secondary" aria-hidden />

          <p className="mt-6 text-base leading-relaxed text-muted md:text-lg">
            {aboutContent.whoWeAre.lead}
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
            {aboutContent.whoWeAre.body}
          </p>

          <div className="mt-9">
            <Button href="/about" size="lg">
              Learn more about the Coalition
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, delay: 0.12, ease: easeOut }}
          className="relative"
        >
          <div
            className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/[0.06] via-transparent to-secondary/[0.08] md:-inset-8"
            aria-hidden
          />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Founding Member Institutions
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              Six institutions established the Coalition and provide its
              executive leadership.
            </p>

            <ul className="mt-8 space-y-0">
              {aboutContent.foundingMembers.map((member, index) => {
                const { label, acronym } = memberParts(member.name);
                const content = (
                  <>
                    <span className="font-display text-xs font-semibold tracking-[0.16em] text-secondary transition-colors group-hover:text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-base font-bold tracking-tight text-neutral-900 transition-colors group-hover:text-primary">
                        {label}
                      </span>
                      {acronym && (
                        <span className="mt-0.5 block text-xs font-medium tracking-wide text-muted">
                          {acronym}
                        </span>
                      )}
                    </span>
                    {member.href && (
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                    )}
                  </>
                );

                return (
                  <li key={member.name}>
                    <motion.div
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-20px" }}
                      transition={{
                        delay: 0.08 + index * 0.06,
                        duration: 0.45,
                        ease: easeOut,
                      }}
                    >
                      {member.href ? (
                        <a
                          href={member.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-start gap-4 border-t border-primary/10 py-4 transition-colors hover:border-secondary"
                        >
                          {content}
                        </a>
                      ) : (
                        <div className="group flex items-start gap-4 border-t border-primary/10 py-4">
                          {content}
                        </div>
                      )}
                    </motion.div>
                  </li>
                );
              })}
            </ul>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
