import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { StoreCatalog } from "@/components/store/StoreCatalog";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: `Store | ${siteConfig.name}`,
  description: `Support ${siteConfig.name} with official merchandise.`,
};

export default function StorePage() {
  return (
    <>
      <main className="min-h-svh bg-background px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <StoreCatalog />
        </div>
      </main>
      <Footer />
    </>
  );
}
