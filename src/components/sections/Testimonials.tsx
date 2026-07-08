import { Section, SectionHeader } from "@/components/ui/Section";
import { TestimonialCarousel } from "@/components/ui/TestimonialCarousel";

export function Testimonials() {
  return (
    <Section id="testimonials" variant="default">
      <SectionHeader
        eyebrow="Voices"
        title="What Leaders Are Saying"
        description="Testimonials from community leaders, legal experts, youth, faith leaders, and women leaders across the nation."
      />
      <TestimonialCarousel />
    </Section>
  );
}
