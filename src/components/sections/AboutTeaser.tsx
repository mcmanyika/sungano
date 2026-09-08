"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { aboutContent } from "@/lib/about";
import { easeOut } from "@/lib/animations";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeToPublishedHeroVideo } from "@/lib/firebase/videos";
import type { GalleryVideo } from "@/types/video";

export function AboutTeaser() {
  const [heroVideo, setHeroVideo] = useState<GalleryVideo | null>(null);
  const showVideo = Boolean(heroVideo?.youtubeId.trim());

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setHeroVideo(null);
      return;
    }

    const unsubscribe = subscribeToPublishedHeroVideo((video) => {
      setHeroVideo(video);
    });

    return unsubscribe;
  }, []);

  return (
    <Section id="about" variant="default">
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
            className="mt-3 h-px w-12 origin-left bg-secondary"
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

        {showVideo && heroVideo ? (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.12, ease: easeOut }}
            className="relative min-w-0"
          >
            <YouTubeEmbed
              videoId={heroVideo.youtubeId}
              title={heroVideo.title || "Welcome video"}
              variant="hero"
            />
          </motion.div>
        ) : null}
      </div>
    </Section>
  );
}
