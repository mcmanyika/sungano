"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePageLoad } from "@/components/providers/PageLoadProvider";
import { Button } from "@/components/ui/Button";
import { DeclarationModal } from "@/components/ui/DeclarationModal";
import { LatestTweetModal } from "@/components/ui/LatestTweetModal";
import { HeroVideoCard } from "@/components/ui/HeroVideoCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { easeOut, fadeUp, staggerContainer } from "@/lib/animations";
import {
  getDefaultWelcomeVideo,
  getWelcomeVideo,
  subscribeToWelcomeVideo,
} from "@/lib/firebase/welcome-video";
import { stats } from "@/lib/data";
import { siteContainer } from "@/lib/layout";
import { cn } from "@/lib/utils";
import type { WelcomeVideo } from "@/types/welcome-video";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Hero() {
  const { isReady } = usePageLoad();
  const [declarationOpen, setDeclarationOpen] = useState(false);
  const [tweetOpen, setTweetOpen] = useState(false);
  const [welcomeVideo, setWelcomeVideo] = useState<WelcomeVideo>(getDefaultWelcomeVideo());
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const animateState = isReady ? "visible" : "hidden";
  const showVideo =
    Boolean(welcomeVideo.youtubeId.trim()) && welcomeVideo.published;

  useEffect(() => {
    let cancelled = false;

    async function loadVideo() {
      try {
        const video = await getWelcomeVideo();
        if (!cancelled) {
          setWelcomeVideo(video);
        }
      } catch {
        // Subscription below will retry live updates.
      }
    }

    void loadVideo();
    const unsubscribe = subscribeToWelcomeVideo((video) => {
      if (!cancelled) {
        setWelcomeVideo(video);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex min-h-svh flex-col overflow-hidden pt-24"
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
          <div
            className={cn(
              showVideo &&
                "grid items-center gap-8 max-lg:[&>*:last-child]:order-first md:gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8 xl:gap-12",
            )}
          >
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={animateState}
            className={showVideo ? "min-w-0" : "max-w-3xl"}
          >
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.7, ease: easeOut }}
              className="font-display text-[2.5rem] font-extrabold leading-[1.08] tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[4rem]"
            >
              Restore Our Democracy.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: easeOut }}
              className="mt-7 text-lg leading-[1.55] text-white/90 md:text-xl"
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
                className="border-white/40 bg-white/15 text-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-md hover:border-white/70 hover:bg-white hover:text-primary"
              >
                Read the Declaration
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>

          {showVideo && (
            <div className="relative z-10 w-full min-w-0">
              <HeroVideoCard video={welcomeVideo} />
            </div>
          )}
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
                transition={{ duration: 0.5, delay: 0.6 + index * 0.08, ease: easeOut }}
                className={cn(
                  "px-5 py-7 text-center sm:px-6",
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
        href="#rights"
        variants={fadeUp}
        initial="hidden"
        animate={animateState}
        transition={{ duration: 0.6, delay: 0.9, ease: easeOut }}
        className="absolute bottom-[5.75rem] left-1/2 z-20 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-neutral-200/80 bg-white/80 text-neutral-400 shadow-sm backdrop-blur-sm transition-colors hover:border-primary/20 hover:text-primary max-md:hidden"
        aria-label="Scroll to learn more"
      >
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </motion.a>

      <motion.button
        type="button"
        onClick={() => setTweetOpen(true)}
        variants={fadeUp}
        initial="hidden"
        animate={animateState}
        transition={{ duration: 0.6, delay: 0.85, ease: easeOut }}
        className="absolute bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-neutral-900/90 text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-md transition hover:scale-105 hover:bg-neutral-900 sm:bottom-6 sm:right-8"
        aria-label="View latest post on X"
      >
        <XIcon className="h-5 w-5" />
      </motion.button>

      <DeclarationModal
        open={declarationOpen}
        onClose={() => setDeclarationOpen(false)}
      />
      <LatestTweetModal
        open={tweetOpen}
        onClose={() => setTweetOpen(false)}
      />
    </section>
  );
}
