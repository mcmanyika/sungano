"use client";

import { Section, SectionHeader } from "@/components/ui/Section";
import { StoreCatalog } from "@/components/store/StoreCatalog";

export function StoreSection() {
  return (
    <Section id="store" className="scroll-mt-28">
      <SectionHeader title="Store" />
      <StoreCatalog limit={3} showHeader={false} showViewAll />
    </Section>
  );
}
