"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePageLoad } from "@/components/providers/PageLoadProvider";
import { Button } from "@/components/ui/Button";
import { navLinks, siteConfig } from "@/lib/data";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { easeOut, slideDown } from "@/lib/animations";
import { cn } from "@/lib/utils";

/** Sticky navbar — transparent at top, solid on scroll */
export function Navbar() {
  const scrollY = useScrollPosition();
  const { isReady } = usePageLoad();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isScrolled = scrollY > 20;

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <motion.header
      initial="hidden"
      animate={isReady ? "visible" : "hidden"}
      variants={slideDown}
      transition={{ duration: 0.65, delay: 0.05, ease: easeOut }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-neutral-200/80 bg-white/90 shadow-sm backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/90"
          : "bg-transparent",
      )}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-bold text-primary dark:text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            {siteConfig.initials}
          </span>
          <span className="hidden sm:inline">{siteConfig.shortName}</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:text-primary dark:text-neutral-300 dark:hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <div className="hidden flex-col items-end gap-1.5 sm:flex">
            <Button href="#contact" size="sm">
              Join the Movement
            </Button>
            <Image
              src="/images/zimbabwe-flag.svg"
              alt="Flag of Zimbabwe"
              width={36}
              height={24}
              className="mt-2 mr-1 h-4 w-auto rounded-sm border border-neutral-200/70 shadow-sm"
              priority
            />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-neutral-600 lg:hidden dark:text-neutral-300"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-neutral-200 bg-white lg:hidden dark:border-neutral-800 dark:bg-neutral-950"
          >
            <ul className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-3 text-base font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-900"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <Button href="#contact" className="w-full">
                  Join the Movement
                </Button>
              </li>
              <li className="flex justify-end pt-3">
                <Image
                  src="/images/zimbabwe-flag.svg"
                  alt="Flag of Zimbabwe"
                  width={36}
                  height={24}
                  className="mt-1 mr-1 h-4 w-auto rounded-sm border border-neutral-200/70 shadow-sm"
                />
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
