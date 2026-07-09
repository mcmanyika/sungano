"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { usePageLoad } from "@/components/providers/PageLoadProvider";
import { Button } from "@/components/ui/Button";
import { DeclarationModal } from "@/components/ui/DeclarationModal";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { easeOut, fadeUp, staggerContainer } from "@/lib/animations";
import { stats, siteConfig } from "@/lib/data";

export function Hero() {
  const { isReady } = usePageLoad();
  const [declarationOpen, setDeclarationOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const animateState = isReady ? "visible" : "hidden";

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-24 pb-16"
    >
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute inset-0 -top-[8%] -bottom-[8%] -z-10"
        aria-hidden
      >
        <Image
          src="/images/banner2.png"
          alt=""
          fill
          priority
          fetchPriority="high"
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Hero overlay — light left, deep primary right */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/92 via-[#0F3D91]/55 to-[#0a2d6b]/88" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F3D91]/15 to-[#0a2d6b]/40" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1F8A70]/20 via-transparent to-[#C9A227]/10" />
      </motion.div>

      <motion.div style={{ opacity }} className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={animateState}
          className="max-w-3xl"
        >
            <motion.div variants={fadeUp} transition={{ duration: 0.6, ease: easeOut }}>
              <span className="eyebrow-pill eyebrow-pill-hero text-white">{siteConfig.eyebrow}</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.7, ease: easeOut }}
              className="mt-6 font-display text-[2.5rem] font-extrabold leading-[1.08] tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl lg:text-[4rem]"
            >
              Restore Our Democracy.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: easeOut }}
              className="mt-7 text-lg leading-relaxed text-white/90 md:text-xl"
            >
              Justice in the Courts.
              <br />
              Sovereignty with the People.
              <br />
              <span className="font-semibold text-secondary-light">
                Peacefully. Lawfully. Together.
              </span>
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, ease: easeOut }}
              className="mt-9"
            >
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setDeclarationOpen(true)}
              >
                Read the Declaration
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={animateState}
          transition={{ duration: 0.7, delay: 0.5, ease: easeOut }}
          className="mt-20 grid grid-cols-2 divide-white/15 rounded-2xl border border-white/20 bg-primary-dark/75 backdrop-blur-md md:grid-cols-4 md:divide-x"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.08, ease: easeOut }}
              className="px-6 py-7 text-center"
            >
              <p className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-white/90">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.a
        href="#rights"
        variants={fadeUp}
        initial="hidden"
        animate={animateState}
        transition={{ duration: 0.6, delay: 0.9, ease: easeOut }}
        className="absolute bottom-6 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-neutral-200/80 bg-white/80 text-neutral-400 shadow-sm backdrop-blur-sm transition-colors hover:border-primary/20 hover:text-primary"
        aria-label="Scroll to learn more"
      >
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </motion.a>

      <DeclarationModal
        open={declarationOpen}
        onClose={() => setDeclarationOpen(false)}
      />
    </section>
  );
}
