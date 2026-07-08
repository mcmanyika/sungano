import { Section, SectionHeader } from "@/components/ui/Section";
import { Timeline } from "@/components/ui/Timeline";
import { siteConfig } from "@/lib/data";

export function WhatHappened() {
  return (
    <Section id="timeline" variant="muted">
      <SectionHeader
        eyebrow="Our Story"
        title="What Happened"
        description={`A timeline of events that led to the formation of ${siteConfig.name}.`}
      />
      <Timeline />
    </Section>
  );
}
