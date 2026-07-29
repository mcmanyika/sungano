"use client";

import { motion } from "framer-motion";
import { usePageLoad } from "@/components/providers/PageLoadProvider";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { useSiteNavigation } from "@/hooks/useSiteNavigation";
import { easeOut, fadeUp } from "@/lib/animations";

/** Vertical social rail: starts mid-hero, sticks under the navbar, ends before gallery. */
export function StickySocialRail() {
  const { isReady } = usePageLoad();
  const { navigation } = useSiteNavigation();

  return (
    <div className="pointer-events-none absolute inset-y-0 right-8 z-40 hidden w-12 pt-[max(7.5rem,calc(50svh-7rem))] min-[1200px]:block">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate={isReady ? "visible" : "hidden"}
        transition={{ duration: 0.6, delay: 0.55, ease: easeOut }}
        className="pointer-events-auto sticky top-28 self-start"
      >
        <SocialLinks
          links={navigation.social}
          orientation="vertical"
          className="gap-2.5"
          linkClassName="h-9 w-9 border-white/25 bg-neutral-900/55 text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-md sm:h-10 sm:w-10"
          iconClassName="h-3.5 w-3.5 sm:h-4 sm:w-4"
        />
      </motion.div>
    </div>
  );
}
