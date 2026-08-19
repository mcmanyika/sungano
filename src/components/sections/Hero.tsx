"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { usePageLoad } from "@/components/providers/PageLoadProvider";
import { Button } from "@/components/ui/Button";
import { DeclarationModal } from "@/components/ui/DeclarationModal";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { VolunteerRegisterForm } from "@/components/ui/VolunteerRegisterForm";
import { easeOut, fadeUp, staggerContainer } from "@/lib/animations";
import { stats } from "@/lib/data";
import { siteContainer } from "@/lib/layout";
import { cn } from "@/lib/utils";

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
      className="relative flex min-h-svh flex-col overflow-x-hidden pt-24"
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
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/85 via-[#0F3D91]/40 to-[#0a2d6b]/65" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F3D91]/10 to-[#0a2d6b]/28" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1F8A70]/25 via-transparent to-[#C9A227]/18" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className={cn(siteContainer, "relative z-10 flex flex-1 flex-col")}
      >
        <div className="flex flex-1 flex-col justify-center py-6 md:py-8">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10 xl:gap-12">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={animateState}
              className="min-w-0 max-w-3xl"
            >
              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.7, ease: easeOut }}
                className="font-display text-[1.9rem] font-extrabold leading-[1.12] tracking-tight text-white drop-shadow-sm sm:text-[2.4rem] md:text-[2.75rem] lg:text-[3rem] xl:text-[3.25rem]"
              >
                People&apos;s Coalition for
                <br />
                <span className="text-neutral-950">Constitutional</span> Democracy
              </motion.h1>

              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.6, ease: easeOut }}
                className="mt-5 text-lg leading-[1.55] text-white/90 md:text-xl"
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
                className="mt-7"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setDeclarationOpen(true)}
                  className="border-white/40 bg-white/15 text-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-md hover:border-white/70 hover:bg-white hover:text-primary"
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
              transition={{ duration: 0.7, delay: 0.15, ease: easeOut }}
              className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-primary-dark/45 p-5 shadow-[0_24px_60px_rgba(10,45,107,0.4)] backdrop-blur-xl sm:p-6">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/12 via-[#0F3D91]/30 to-[#0a2d6b]/45"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#C9A227]/30 blur-3xl"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-[#1F8A70]/28 blur-3xl"
                />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary-light">
                    Get involved
                  </p>
                  <h2 className="mt-1 mb-4 font-display text-2xl font-bold tracking-tight text-white">
                    VOLUNTEER WITH US
                  </h2>
                  <VolunteerRegisterForm compact tone="hero" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 mt-auto w-full border-t border-white/15 bg-primary-dark/70 backdrop-blur-xl">
        <div className={siteContainer}>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                whileHover={{
                  y: -4,
                  scale: 1.03,
                  transition: { duration: 0.25, ease: easeOut },
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.6 + index * 0.08,
                  ease: easeOut,
                }}
                className={cn(
                  "cursor-default px-5 py-5 text-center transition-colors sm:px-6",
                  "hover:bg-white/10",
                  index % 2 === 1 && "border-l border-white/10",
                  index >= 2 && "border-t border-white/10 md:border-t-0",
                  index >= 1 && "md:border-l md:border-white/10",
                )}
              >
                <p className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.a
        href="#about"
        variants={fadeUp}
        initial="hidden"
        animate={animateState}
        transition={{ duration: 0.6, delay: 0.9, ease: easeOut }}
        className="absolute bottom-[5.75rem] left-1/2 z-20 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-neutral-200/80 bg-white/80 text-neutral-400 shadow-sm backdrop-blur-sm transition-colors hover:border-primary/20 hover:text-primary max-md:hidden"
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
