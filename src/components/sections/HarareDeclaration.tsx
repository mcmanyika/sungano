"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { EmailSubscribe } from "@/components/ui/EmailSubscribe";

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
      className="relative overflow-hidden py-28 md:py-36"
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

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-3xl px-5 text-center sm:px-8"
      >
        <blockquote className="font-display text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl">
          Restore the Constitution:
        </blockquote>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl">
          Justice in the Courts.
          <br />
          Sovereignty with the People.
          <br />
          Peacefully. Lawfully. Together.
        </p>
        <div className="mt-10">
          <EmailSubscribe source="harare-declaration" />
        </div>
      </motion.div>
    </section>
  );
}
