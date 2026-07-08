"use client";

import { motion } from "framer-motion";
import { getInvolvedActions } from "@/lib/data";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export function GetInvolved() {
  return (
    <Section id="involved" variant="default">
      <SectionHeader
        eyebrow="Participate"
        title="Get Involved"
        description="There are many ways to join the movement and contribute to peaceful constitutional restoration."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {getInvolvedActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -6 }}
            className="flex flex-col rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              <action.icon className="h-7 w-7" />
            </div>
            <h3 className="font-display text-xl font-bold text-neutral-900 dark:text-white">
              {action.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {action.description}
            </p>
            <Button href={action.href} variant="outline" size="sm" className="mt-6 w-full">
              {action.cta}
            </Button>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
