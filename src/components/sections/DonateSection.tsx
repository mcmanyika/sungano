"use client";

import { Heart, Landmark, Repeat, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { DonateModal } from "@/components/ui/DonateModal";

const highlights = [
  {
    icon: Repeat,
    title: "One-time or recurring",
    description: "Give once, or set up a monthly or yearly gift.",
  },
  {
    icon: Landmark,
    title: "Any currency",
    description: "Donate in USD, ZAR, GBP, or EUR.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Stripe",
    description: "Payments are handled by Stripe. Cancel anytime.",
  },
];

export function DonateSection() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function openFromHash() {
      if (window.location.hash === "#donate") {
        setOpen(true);
      }
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  return (
    <>
      <Section id="donate" className="scroll-mt-28" variant="muted">
        <SectionHeader
          eyebrow="Donate"
          title="Fund the movement"
          description="Every contribution supports civic education, community dialogues, and peaceful, lawful work to restore the Constitution."
        />

        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-neutral-200/70 bg-white/70 p-5 text-center"
              >
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-neutral-900">{item.title}</h3>
                <p className="mt-1 text-sm text-muted">{item.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <Button type="button" size="lg" onClick={() => setOpen(true)}>
            <Heart className="h-4 w-4" />
            Donate now
          </Button>
          <a
            href="/partner"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Partner sign in — track your donations
          </a>
        </div>
      </Section>

      <DonateModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
