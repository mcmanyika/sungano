"use client";

import { usePathname } from "next/navigation";
import { FirebaseProvider } from "@/components/providers/FirebaseProvider";
import { PageLoadProvider } from "@/components/providers/PageLoadProvider";
import { FloatingCTA } from "@/components/layout/FloatingCTA";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";

function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <PageLoadProvider>
      <ScrollProgress />
      <Navbar />
      {children}
      <FloatingCTA />
    </PageLoadProvider>
  );
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseProvider>
      <SiteChrome>{children}</SiteChrome>
    </FirebaseProvider>
  );
}
