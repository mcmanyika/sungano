import type { Metadata } from "next";
import { DonationSuccessView } from "@/components/donate/DonationSuccessView";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: `Thank you — ${siteConfig.shortName}`,
  description: "Thank you for supporting the Coalition.",
  robots: { index: false, follow: false },
};

export default function DonationSuccessPage() {
  return <DonationSuccessView />;
}
