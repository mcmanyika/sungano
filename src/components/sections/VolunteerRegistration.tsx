"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { VolunteerModal } from "@/components/ui/VolunteerModal";

export function VolunteerRegistration() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Section id="organisations" className="scroll-mt-28" variant="default">
        <SectionHeader
          title="Join the Coalition"
          description="Membership is institutional. Duly constituted organisations that share our principles can register interest through an authorised representative."
        />

        <div className="flex justify-center">
          <Button type="button" size="lg" onClick={() => setOpen(true)}>
            Register institutional interest
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Section>

      <VolunteerModal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Join the Coalition"
        title="Institutional registration"
        description="Submit details for an authorised representative of your institution. Select Institutional Membership as your area of interest."
      />
    </>
  );
}
