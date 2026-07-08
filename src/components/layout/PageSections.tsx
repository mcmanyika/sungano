"use client";

import { motion } from "framer-motion";
import { Footer } from "@/components/layout/Footer";
import { usePageLoad } from "@/components/providers/PageLoadProvider";
import { CampaignActivities } from "@/components/sections/CampaignActivities";
import { ConstitutionalRights } from "@/components/sections/ConstitutionalRights";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { GetInvolved } from "@/components/sections/GetInvolved";
import { HarareDeclaration } from "@/components/sections/HarareDeclaration";
import { Hero } from "@/components/sections/Hero";
import { Mission } from "@/components/sections/Mission";
import { NewsUpdates } from "@/components/sections/NewsUpdates";
import { Pillars } from "@/components/sections/Pillars";
import { Resources } from "@/components/sections/Resources";
import { WhatHappened } from "@/components/sections/WhatHappened";
import { fadeIn, staggerContainer, staggerItem } from "@/lib/animations";

const sections = [
  WhatHappened,
  Mission,
  Pillars,
  ConstitutionalRights,
  HarareDeclaration,
  CampaignActivities,
  NewsUpdates,
  Resources,
  GetInvolved,
  FAQ,
  FinalCTA,
];

/** Staggered section reveal after the loading screen completes */
export function PageSections() {
  const { isReady } = usePageLoad();

  return (
    <>
      <Hero />
      <motion.main
        variants={staggerContainer}
        initial="hidden"
        animate={isReady ? "visible" : "hidden"}
      >
        {sections.map((Section) => (
          <motion.div key={Section.name} variants={staggerItem}>
            <Section />
          </motion.div>
        ))}
      </motion.main>
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate={isReady ? "visible" : "hidden"}
        transition={{ duration: 0.8, delay: 0.35 }}
      >
        <Footer />
      </motion.div>
    </>
  );
}
