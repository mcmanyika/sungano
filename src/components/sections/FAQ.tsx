import { faqItems } from "@/lib/data";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";

export function FAQ() {
  return (
    <Section id="faq" variant="muted">
      <SectionHeader
        eyebrow="Questions"
        title="Frequently Asked Questions"
        description="Find answers to common questions about the movement and how to participate."
      />
      <div className="mx-auto max-w-3xl">
        <Accordion items={faqItems} />
      </div>
    </Section>
  );
}
