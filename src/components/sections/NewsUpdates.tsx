"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import Image from "next/image";
import { newsArticles, siteConfig } from "@/lib/data";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { cardSurfaceInteractive } from "@/lib/styles";
import { cn } from "@/lib/utils";

const newsImages = [
  "/images/news-civic-education.svg",
  "/images/news-legal-review.svg",
  "/images/news-declaration.svg",
];

export function NewsUpdates() {
  return (
    <Section id="news" variant="default">
      <SectionHeader
        eyebrow="Stay Informed"
        title="News & Updates"
        description={`Latest news, events, and developments from ${siteConfig.name}.`}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {newsArticles.map((article, index) => (
          <motion.article
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            className={cn(cardSurfaceInteractive, "group overflow-hidden")}
          >
            <div className="relative h-44 overflow-hidden">
              <Image
                src={newsImages[index]}
                alt={article.title}
                fill
                loading="lazy"
                fetchPriority="low"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {article.date}
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {article.category}
                </span>
              </div>
              <h3 className="mt-3 font-display text-base font-bold tracking-tight text-neutral-900 transition-colors group-hover:text-primary">
                {article.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {article.excerpt}
              </p>
              <Button variant="ghost" className="mt-3 -ml-2 px-3 text-sm" href="#">
                Read More
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}
