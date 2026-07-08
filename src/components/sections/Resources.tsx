"use client";

import { motion } from "framer-motion";
import { Download, FileText } from "lucide-react";
import { resources } from "@/lib/data";
import { Section, SectionHeader } from "@/components/ui/Section";

export function Resources() {
  return (
    <Section id="resources" variant="muted">
      <SectionHeader
        eyebrow="Downloads"
        title="Resources"
        description="Essential documents, toolkits, and educational materials for civic engagement."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource, index) => (
          <motion.a
            key={resource.title}
            href="#"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -4 }}
            className="group flex items-center gap-4 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-primary/40"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              <FileText className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                {resource.title}
              </h3>
              <p className="text-sm text-neutral-500">
                {resource.type} · {resource.size}
              </p>
            </div>
            <Download className="h-5 w-5 shrink-0 text-neutral-400" />
          </motion.a>
        ))}
      </div>
    </Section>
  );
}
