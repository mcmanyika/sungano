import type { Metadata } from "next";
import { StoreSuccessView } from "@/components/store/StoreSuccessView";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: `Order confirmed — ${siteConfig.shortName}`,
  description: "Thank you for your merchandise order.",
  robots: { index: false, follow: false },
};

export default function StoreSuccessPage() {
  return <StoreSuccessView />;
}
