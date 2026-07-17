"use client";

import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { VolunteerModal } from "@/components/ui/VolunteerModal";
import { aboutContent } from "@/lib/about";

export function JoinCoalitionCta() {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function syncFromHash() {
      if (window.location.hash === "#join") {
        openModal();
      }
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [openModal]);

  function handleClose() {
    closeModal();
    if (window.location.hash === "#join") {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }

  return (
    <>
      <section id="join" className="scroll-mt-28">
        <h2 className="font-display text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
          Join the Coalition
        </h2>
        <div className="mt-4 h-px w-12 bg-secondary" aria-hidden />
        <div className="mt-6 space-y-4 text-base leading-relaxed text-neutral-700 md:text-[17px]">
          <p>{aboutContent.join.lead}</p>
          <p>{aboutContent.join.body}</p>
          <p className="pt-2">
            Institutions interested in membership can connect with us through
            the registration form.
          </p>
          <div className="pt-2">
            <Button type="button" size="lg" onClick={openModal}>
              Register institutional interest
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <VolunteerModal
        open={open}
        onClose={handleClose}
        eyebrow="Join the Coalition"
        title="Institutional registration"
        description="Submit details for an authorised representative of your institution. Select Institutional Membership as your area of interest."
      />
    </>
  );
}
