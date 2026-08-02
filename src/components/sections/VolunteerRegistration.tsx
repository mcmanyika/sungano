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
      <Section id="volunteer" className="scroll-mt-28" variant="default">
        <SectionHeader
          title="Volunteer with Us"
          description="Ordinary people across Zimbabwe and the diaspora can register to support civic education, community mobilisation, and peaceful, lawful constitutional work."
        />

        <div className="flex justify-center">
          <Button type="button" size="lg" onClick={() => setOpen(true)}>
            Register as a volunteer
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Section>

      <VolunteerModal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Get involved"
        title="Volunteer registration"
        description="Tell us who you are and how you’d like to help. We’ll follow up with next steps."
      />
    </>
  );
}
