"use client";

import { motion } from "framer-motion";
import { Footer } from "@/components/layout/Footer";
import { StickySocialRail } from "@/components/layout/StickySocialRail";
import { usePageLoad } from "@/components/providers/PageLoadProvider";
import { AboutTeaser } from "@/components/sections/AboutTeaser";
import { ContactUs } from "@/components/sections/ContactUs";
import { HarareDeclaration } from "@/components/sections/HarareDeclaration";
import { Hero } from "@/components/sections/Hero";
import { NewsUpdates } from "@/components/sections/NewsUpdates";
import { Polls } from "@/components/sections/Polls";
import { ImageGallery } from "@/components/sections/ImageGallery";
import { StoreSection } from "@/components/sections/StoreSection";
import { fadeIn, staggerContainer, staggerItem } from "@/lib/animations";

const sections = [
  AboutTeaser,
  ImageGallery,
  NewsUpdates,
  Polls,
  HarareDeclaration,
  StoreSection,
  ContactUs,
];

/** Staggered section reveal after the loading screen completes */
export function PageSections() {
  const { isReady } = usePageLoad();

  return (
    <div className="relative">
      <StickySocialRail />
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
    </div>
  );
}
