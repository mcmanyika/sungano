"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
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

function memberParts(name: string) {
  const match = name.match(/^(.*?)\s*\(([^)]+)\)\s*$/);

  if (!match) {
    return { label: name, acronym: null as string | null };
  }

  return { label: match[1], acronym: match[2] };
}

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

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-12">
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
              Learn more about the Coalition
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, delay: 0.12, ease: easeOut }}
          className="relative min-w-0"
        >
          {showVideo ? (
            <YouTubeEmbed
              videoId={welcomeVideo.youtubeId}
              title={welcomeVideo.title || "Welcome video"}
            />
          ) : (
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Founding Member Institutions
              </p>
              <FoundingMembersList />
            </div>
          )}
        </motion.div>
      </div>

      {showVideo ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, delay: 0.08, ease: easeOut }}
          className="relative mt-10 md:mt-12"
        >
          <div
            className="pointer-events-none absolute -inset-4 rounded-[1.75rem] bg-gradient-to-br from-primary/[0.06] via-transparent to-secondary/[0.08] md:-inset-6"
            aria-hidden
          />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Founding Member Institutions
            </p>
            <FoundingMembersList />
          </div>
        </motion.div>
      ) : null}
    </Section>
  );
}

function FoundingMembersList() {
  return (
    <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {aboutContent.foundingMembers.map((member, index) => {
        const { label, acronym } = memberParts(member.name);
        const content = (
          <>
            <span className="font-display text-xs font-semibold tracking-[0.16em] text-secondary transition-colors group-hover:text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="mt-2 block font-display text-base font-bold tracking-tight text-neutral-900 transition-colors group-hover:text-primary">
              {label}
            </span>
            {acronym ? (
              <span className="mt-0.5 block text-xs font-medium tracking-wide text-muted">
                {acronym}
              </span>
            ) : null}
            {member.href ? (
              <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
            ) : null}
          </>
        );

        return (
          <li key={member.name}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{
                delay: 0.08 + index * 0.05,
                duration: 0.45,
                ease: easeOut,
              }}
              className="h-full"
            >
              {member.href ? (
                <a
                  href={member.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block h-full border-t border-primary/15 pt-3 pr-8 transition-colors hover:border-secondary"
                >
                  {content}
                </a>
              ) : (
                <div className="group relative h-full border-t border-primary/15 pt-3">
                  {content}
                </div>
              )}
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}
