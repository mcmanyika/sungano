import type { Metadata } from "next";
import { DonatePageView } from "@/components/donate/DonatePageView";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: `Donate — ${siteConfig.shortName}`,
  description:
    "Support Sungano Ubumbano with a one-time or recurring donation.",
};

export default function DonatePage() {
  return <DonatePageView />;
}
