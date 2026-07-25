import type { Metadata } from "next";
import { PartnerPortal } from "@/components/partner/PartnerPortal";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: `Partner Portal — ${siteConfig.shortName}`,
  description: "Sign in to make and track your donations to the Coalition.",
  robots: { index: false, follow: false },
};

export default function PartnerPage() {
  return <PartnerPortal />;
}
