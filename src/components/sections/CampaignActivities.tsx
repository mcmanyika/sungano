"use client";

import { motion } from "framer-motion";
import { campaignActivities } from "@/lib/data";
import { Section, SectionHeader } from "@/components/ui/Section";
import { cardSurfaceInteractive } from "@/lib/styles";
import { cn } from "@/lib/utils";

export function CampaignActivities() {
  return (
    <Section id="activities" variant="muted">
      <SectionHeader
        eyebrow="Take Action"
        title="Campaign Activities"
        description="Peaceful, lawful activities that engage citizens across the nation in constitutional restoration."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {campaignActivities.map((activity, index) => (
          <motion.div
            key={activity.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.06, duration: 0.5 }}
            className={cn(cardSurfaceInteractive, "group p-6")}
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition-colors group-hover:bg-primary/5 group-hover:text-primary">
              <activity.icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="font-display text-base font-bold tracking-tight text-neutral-900">
              {activity.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {activity.description}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
