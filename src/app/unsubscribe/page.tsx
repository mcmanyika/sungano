import type { Metadata } from "next";
import { UnsubscribePageView } from "@/components/email/UnsubscribePageView";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: `Unsubscribe — ${siteConfig.shortName}`,
  description: `Leave the ${siteConfig.shortName} mailing list.`,
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return <UnsubscribePageView />;
}
