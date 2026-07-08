"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-primary-dark to-neutral-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
      >
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
          Stand for Constitutional Democracy
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
          Join thousands committed to peaceful constitutional restoration through
          justice, civic participation and the rule of law.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button href="#contact" variant="gold" size="lg">
            Join the Movement
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button href="#contact" variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
            Subscribe
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
