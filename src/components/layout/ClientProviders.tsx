"use client";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { PageLoadProvider } from "@/components/providers/PageLoadProvider";
import { FloatingCTA } from "@/components/layout/FloatingCTA";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PageLoadProvider>
        <ScrollProgress />
        <Navbar />
        {children}
        <FloatingCTA />
      </PageLoadProvider>
    </ThemeProvider>
  );
}
