import type { Metadata } from "next";
import { HallOfShameView } from "@/components/hall-of-shame/HallOfShameView";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Hall of Shame",
  description: `A public record of alleged political violence and intimidation documented by ${siteConfig.name}. Anonymous reports are accepted and moderated before publication.`,
  openGraph: {
    title: `Hall of Shame | ${siteConfig.name}`,
    description:
      "Documented allegations of political violence and intimidation. Submit anonymously.",
    url: `${siteConfig.url}/hall-of-shame`,
  },
};

export default function HallOfShamePage() {
  return <HallOfShameView />;
}
