"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { aboutContent } from "@/lib/about";
import { easeOut } from "@/lib/animations";
import {
  getDefaultWelcomeVideo,
  getWelcomeVideo,
  subscribeToWelcomeVideo,
} from "@/lib/firebase/welcome-video";
import type { WelcomeVideo } from "@/types/welcome-video";

export function AboutTeaser() {
  const [welcomeVideo, setWelcomeVideo] = useState<WelcomeVideo>(
    getDefaultWelcomeVideo,
  );
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
    <Section id="about" variant="default" className="overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#eef3fb] via-background to-[#f4f7f2]" />
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div
        className={
          showVideo
            ? "grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 xl:gap-16"
            : "max-w-3xl"
        }
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="min-w-0"
        >
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
            }}
            className="text-xs font-semibold uppercase tracking-[0.16em] text-accent"
          >
            About the Coalition
          </motion.p>

          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
            }}
            className="mt-3 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-[2.65rem] md:leading-[1.12]"
          >
            Who We Are
          </motion.h2>

          <motion.div
            variants={{
              hidden: { opacity: 0, scaleX: 0.4 },
              visible: {
                opacity: 1,
                scaleX: 1,
                transition: { duration: 0.55, ease: easeOut },
              },
            }}
            className="mt-4 h-1 w-14 origin-left rounded-full bg-gradient-to-r from-secondary to-secondary-light"
            aria-hidden
          />

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } },
            }}
            className="mt-6 text-base leading-[1.7] text-neutral-800 md:text-lg"
          >
            {aboutContent.whoWeAre.lead}
          </motion.p>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } },
            }}
            className="mt-4 text-base leading-[1.7] text-muted md:text-lg"
          >
            {aboutContent.whoWeAre.body}
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
            }}
            className="mt-8"
          >
            <Button href="/about" size="lg">
              Learn More
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>

        {showVideo ? (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.12, ease: easeOut }}
            className="relative min-w-0"
          >
            <div
              className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-primary/12 via-transparent to-secondary/20 sm:-inset-4"
              aria-hidden
            />
            <div
              className="absolute -bottom-3 -right-3 hidden h-24 w-24 rounded-br-[1.5rem] border-b-2 border-r-2 border-secondary/50 sm:block"
              aria-hidden
            />
            <div
              className="absolute -left-3 -top-3 hidden h-16 w-16 rounded-tl-[1.5rem] border-l-2 border-t-2 border-primary/30 sm:block"
              aria-hidden
            />

            <div className="relative">
              <YouTubeEmbed
                videoId={welcomeVideo.youtubeId}
                title={welcomeVideo.title || "Welcome video"}
              />
            </div>
          </motion.div>
        ) : null}
      </div>
    </Section>
  );
}
