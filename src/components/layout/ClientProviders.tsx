"use client";

import { PageLoadProvider } from "@/components/providers/PageLoadProvider";
import { FloatingCTA } from "@/components/layout/FloatingCTA";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <PageLoadProvider>
      <ScrollProgress />
      <Navbar />
      {children}
      <FloatingCTA />
    </PageLoadProvider>
  );
}
