import type { Metadata } from "next";
import { AboutPageView } from "@/components/about/AboutPageView";
import { aboutContent } from "@/lib/about";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Us",
  description: `${aboutContent.fullName} (${aboutContent.translation}) is a broad, voluntary and institution-based national coalition committed to constitutional democracy, the rule of law and the sovereignty of the people of Zimbabwe.`,
  openGraph: {
    title: `About Us | ${siteConfig.name}`,
    description: aboutContent.whoWeAre.lead,
    url: `${siteConfig.url}/about`,
  },
};

export default function AboutPage() {
  return <AboutPageView />;
}
