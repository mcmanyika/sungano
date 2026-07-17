"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { EmailSubscribe } from "@/components/ui/EmailSubscribe";
import { easeOut } from "@/lib/animations";

export function HarareDeclaration() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section
      ref={ref}
      id="declaration"
      className="relative overflow-hidden py-28 md:py-40"
    >
      <motion.div
        style={{ y }}
        className="absolute inset-0 -top-[12%] -bottom-[12%]"
        aria-hidden
      >
        <Image
          src="/images/banner3.png"
          alt=""
          fill
          loading="lazy"
          fetchPriority="low"
          className="object-cover object-center"
          sizes="100vw"
        />
      </motion.div>
      <div
        className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary-light/55 to-primary/65"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-primary-dark/35 via-transparent to-primary/20"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, ease: easeOut }}
        className="relative z-10 mx-auto max-w-2xl px-5 text-center sm:px-8"
      >
        <div className="mx-auto mb-6 h-px w-12 bg-secondary" aria-hidden />
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
          Stay Informed
        </h2>
        <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-white/80">
          Subscribe for updates from the Coalition.
        </p>
        <div className="mt-10 rounded-3xl border border-white/15 bg-white/10 p-5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-7">
          <EmailSubscribe source="harare-declaration" />
        </div>
      </motion.div>
    </section>
  );
}
