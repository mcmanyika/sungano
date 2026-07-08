"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import Image from "next/image";
import { newsArticles, siteConfig } from "@/lib/data";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

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

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {newsArticles.map((article, index) => (
          <motion.article
            key={article.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -6 }}
            className="group overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-all hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="relative h-48 overflow-hidden">
              <Image
                src={newsImages[index]}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 text-sm text-neutral-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {article.date}
                </span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary dark:bg-primary/20">
                  {article.category}
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-neutral-900 group-hover:text-primary dark:text-white">
                {article.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {article.excerpt}
              </p>
              <Button variant="ghost" className="mt-4 px-0" href="#">
                Read More
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}
