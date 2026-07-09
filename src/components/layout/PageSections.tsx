"use client";

import { motion } from "framer-motion";
import { Footer } from "@/components/layout/Footer";
import { usePageLoad } from "@/components/providers/PageLoadProvider";
import { ConstitutionalRights } from "@/components/sections/ConstitutionalRights";
import { FAQ } from "@/components/sections/FAQ";
import { HarareDeclaration } from "@/components/sections/HarareDeclaration";
import { Hero } from "@/components/sections/Hero";
import { NewsUpdates } from "@/components/sections/NewsUpdates";
import { fadeIn, staggerContainer, staggerItem } from "@/lib/animations";

const sections = [
  ConstitutionalRights,
  HarareDeclaration,
  NewsUpdates,
  FAQ,
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
