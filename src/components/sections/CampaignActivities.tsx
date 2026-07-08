"use client";

import { motion } from "framer-motion";
import { campaignActivities } from "@/lib/data";
import { Section, SectionHeader } from "@/components/ui/Section";

export function CampaignActivities() {
  return (
    <Section id="activities" variant="muted">
      <SectionHeader
        eyebrow="Take Action"
        title="Campaign Activities"
        description="Peaceful, lawful activities that engage citizens across the nation in constitutional restoration."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {campaignActivities.map((activity, index) => (
          <motion.div
            key={activity.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -4 }}
            className="group rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              <activity.icon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-white">
              {activity.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {activity.description}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
