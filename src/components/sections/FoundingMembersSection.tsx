"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { aboutContent } from "@/lib/about";
import { easeOut } from "@/lib/animations";
import { cardSurface, cardSurfaceInteractive } from "@/lib/styles";
import { cn } from "@/lib/utils";

export function FoundingMembersSection() {
  return (
    <Section id="founding-members" variant="muted" className="scroll-mt-28">
      <SectionHeader
        eyebrow="The Coalition"
        title="Founding member institutions"
        description="The Coalition was established by these institutions. Each keeps its own identity, leadership, and programmes."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {aboutContent.foundingMembers.map((member, index) => {
          const cardClassName = cn(
            "flex h-full items-start justify-between gap-3 p-5",
            member.href ? cardSurfaceInteractive : cardSurface,
          );

          const content = (
            <>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                  Founding member
                </p>
                <p className="mt-2 font-display text-lg font-bold tracking-tight text-neutral-900">
                  {member.name}
                </p>
              </div>
              {member.href ? (
                <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              ) : null}
            </>
          );

          return (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: index * 0.05, ease: easeOut }}
            >
              {member.href ? (
                <a
                  href={member.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClassName}
                >
                  {content}
                </a>
              ) : (
                <div className={cardClassName}>{content}</div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Button href="/about#who-we-are" variant="outline" size="lg">
          Learn more about the Coalition
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Section>
  );
}
