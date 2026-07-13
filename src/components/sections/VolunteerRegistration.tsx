"use client";

import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { VolunteerModal } from "@/components/ui/VolunteerModal";

export function VolunteerRegistration() {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function syncFromHash() {
      if (window.location.hash === "#volunteer") {
        openModal();
      }
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [openModal]);

  function handleClose() {
    closeModal();
    if (window.location.hash === "#volunteer") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  return (
    <>
      <Section id="volunteer" variant="default">
        <SectionHeader
          title="Volunteer With Us"
          description="Join the movement. Register to support peaceful, lawful constitutional restoration in your community."
        />

        <div className="flex justify-center">
          <Button type="button" size="lg" onClick={openModal}>
            Register as Volunteer
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Section>

      <VolunteerModal open={open} onClose={handleClose} />
    </>
  );
}
