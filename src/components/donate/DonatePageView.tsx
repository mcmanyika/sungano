"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { DonateModal } from "@/components/ui/DonateModal";
import { siteConfig } from "@/lib/data";

export function DonatePageView() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleClose = useCallback(() => {
    setOpen(false);
    router.push("/");
  }, [router]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-5 py-24">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Support the Coalition
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-900">
          Donate to {siteConfig.shortName}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Your gift funds civic education, community dialogues, and peaceful,
          lawful constitutional work.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-6 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Open donation form
        </button>
      </div>

      <DonateModal open={open} onClose={handleClose} />
    </main>
  );
}
