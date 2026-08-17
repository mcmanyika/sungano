"use client";

import { motion } from "framer-motion";
import { type ComponentType, useEffect, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { StickySocialRail } from "@/components/layout/StickySocialRail";
import { usePageLoad } from "@/components/providers/PageLoadProvider";
import { AboutTeaser } from "@/components/sections/AboutTeaser";
import { ContactUs } from "@/components/sections/ContactUs";
import { DonationTracker } from "@/components/sections/DonationTracker";
import { HarareDeclaration } from "@/components/sections/HarareDeclaration";
import { Hero } from "@/components/sections/Hero";
import { NewsUpdates } from "@/components/sections/NewsUpdates";
import { Polls } from "@/components/sections/Polls";
import { ImageGallery } from "@/components/sections/ImageGallery";
import { StoreSection } from "@/components/sections/StoreSection";
import { VolunteerRegistration } from "@/components/sections/VolunteerRegistration";
import { fadeIn, staggerContainer, staggerItem } from "@/lib/animations";
import {
  getDefaultLandingSections,
  subscribeToLandingSections,
} from "@/lib/firebase/landing-sections";
import type { LandingSectionId, LandingSections } from "@/types/landing-sections";

const gatedSections: Array<{
  id: LandingSectionId;
  Section: ComponentType;
}> = [
  { id: "gallery", Section: ImageGallery },
  { id: "news", Section: NewsUpdates },
  { id: "polls", Section: Polls },
  { id: "stayInformed", Section: HarareDeclaration },
  { id: "donationTracker", Section: DonationTracker },
  { id: "store", Section: StoreSection },
  { id: "volunteer", Section: VolunteerRegistration },
  { id: "contact", Section: ContactUs },
];

/** Staggered section reveal after the loading screen completes */
export function PageSections() {
  const { isReady } = usePageLoad();
  const [visibility, setVisibility] = useState<LandingSections>(
    getDefaultLandingSections,
  );

  useEffect(() => {
    return subscribeToLandingSections(setVisibility);
  }, []);

  const showHero = visibility.hero;
  const showAbout = visibility.about;
  const showRail = showHero || showAbout;
  const visibleSections = gatedSections.filter(({ id }) => visibility[id]);

  return (
    <>
      {showRail || showHero || showAbout ? (
        <div className="relative">
          {showRail ? <StickySocialRail /> : null}
          {showHero ? <Hero /> : null}
          {showAbout ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={isReady ? "visible" : "hidden"}
            >
              <motion.div variants={staggerItem}>
                <AboutTeaser />
              </motion.div>
            </motion.div>
          ) : null}
        </div>
      ) : null}

      <motion.main
        variants={staggerContainer}
        initial="hidden"
        animate={isReady ? "visible" : "hidden"}
      >
        {visibleSections.map(({ id, Section }) => (
          <motion.div key={id} variants={staggerItem}>
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
