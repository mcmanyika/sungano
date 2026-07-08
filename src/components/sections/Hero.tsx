"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useRef } from "react";
import { usePageLoad } from "@/components/providers/PageLoadProvider";
import { Button } from "@/components/ui/Button";
import { ConstitutionalGraphic } from "@/components/ui/Graphics";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { easeOut, fadeUp, scaleIn, staggerContainer } from "@/lib/animations";
import { stats, siteConfig } from "@/lib/data";

export function Hero() {
  const { isReady } = usePageLoad();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const animateState = isReady ? "visible" : "hidden";

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden pt-20"
    >
      {/* Parallax background */}
      <motion.div style={{ y }} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-primary/5 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary/10" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230F3D91' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 1.2, ease: easeOut }}
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 1.2, delay: 0.15, ease: easeOut }}
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
        />
      </motion.div>

      <motion.div style={{ opacity }} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={animateState}
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: easeOut }}
              className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent"
            >
              {siteConfig.eyebrow}
            </motion.p>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.7, ease: easeOut }}
              className="font-display text-4xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-5xl md:text-6xl lg:text-7xl dark:text-white"
            >
              Restore the Constitution.
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Restore Our Democracy.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: easeOut }}
              className="mt-6 font-display text-xl font-medium text-neutral-700 md:text-2xl dark:text-neutral-300"
            >
              Justice in the Courts.
              <br />
              Sovereignty with the People.
              <br />
              <span className="text-secondary">Peacefully. Lawfully. Together.</span>
            </motion.p>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: easeOut }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400"
            >
              {siteConfig.name} is a peaceful national movement
              committed to defending constitutional democracy through lawful action,
              civic participation and justice.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, ease: easeOut }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Button href="#involved" size="lg">
                Join the Movement
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button href="#declaration" variant="outline" size="lg">
                Read the Declaration
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate={animateState}
            transition={{ duration: 0.9, ease: easeOut }}
            className="relative flex justify-center"
          >
            <motion.div
              animate={isReady ? { y: [0, -8, 0] } : { y: 0 }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <ConstitutionalGraphic className="h-auto w-full max-w-md lg:max-w-lg" />
            </motion.div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={animateState}
          transition={{ duration: 0.7, delay: 0.5, ease: easeOut }}
          className="mt-20 grid grid-cols-2 gap-6 rounded-2xl border border-neutral-200/80 bg-white/80 p-6 shadow-lg backdrop-blur-sm md:grid-cols-4 dark:border-neutral-800 dark:bg-neutral-900/80"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1, ease: easeOut }}
              className="text-center"
            >
              <p className="font-display text-2xl font-bold text-primary md:text-3xl dark:text-white">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm text-neutral-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.a
        href="#timeline"
        variants={fadeUp}
        initial="hidden"
        animate={animateState}
        transition={{ duration: 0.6, delay: 0.9, ease: easeOut }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-neutral-400 transition-colors hover:text-primary"
        aria-label="Scroll to learn more"
      >
        <ChevronDown className="h-8 w-8 animate-bounce" />
      </motion.a>
    </section>
  );
}
