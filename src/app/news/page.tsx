import type { Metadata } from "next";
import { NewsIndexView } from "@/components/news/NewsIndexView";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "News",
  description: `News and updates from ${siteConfig.name}.`,
  openGraph: {
    title: `News | ${siteConfig.name}`,
    description: `Statements, updates, and reports from ${siteConfig.name}.`,
    url: `${siteConfig.url}/news`,
  },
};

export default function NewsPage() {
  return <NewsIndexView />;
}
