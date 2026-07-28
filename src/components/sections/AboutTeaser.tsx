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
    <Section id="about" variant="muted" className="overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

      <div
        className={
          showVideo
            ? "grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-12"
            : undefined
        }
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: easeOut }}
        >
          <h2 className="font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-[2.5rem] md:leading-[1.15]">
            Who We Are
          </h2>
          <div className="mt-3 h-px w-12 bg-secondary" aria-hidden />

          <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
            {aboutContent.whoWeAre.lead}
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted md:text-lg">
            {aboutContent.whoWeAre.body}
          </p>

          <div className="mt-6">
            <Button href="/about" size="lg">
              Learn More
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {showVideo ? (
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, delay: 0.12, ease: easeOut }}
            className="relative min-w-0"
          >
            <YouTubeEmbed
              videoId={welcomeVideo.youtubeId}
              title={welcomeVideo.title || "Welcome video"}
            />
          </motion.div>
        ) : null}
      </div>
    </Section>
  );
}
