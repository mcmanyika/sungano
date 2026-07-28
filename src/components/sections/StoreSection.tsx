"use client";

import { StoreCatalog } from "@/components/store/StoreCatalog";

export function StoreSection() {
  return (
    <section id="store" className="scroll-mt-28 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <StoreCatalog limit={3} showViewAll />
      </div>
    </section>
  );
}
