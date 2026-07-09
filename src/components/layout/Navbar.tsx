"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePageLoad } from "@/components/providers/PageLoadProvider";
import { navLinks, siteConfig } from "@/lib/data";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { easeOut, slideDown } from "@/lib/animations";
import { cn } from "@/lib/utils";

export function Navbar() {
  const scrollY = useScrollPosition();
  const { isReady } = usePageLoad();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isScrolled = scrollY > 16;

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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "border-b border-neutral-200/60 bg-white/80 py-3 shadow-[0_1px_0_rgba(15,61,145,0.04)] backdrop-blur-xl"
          : "bg-transparent py-5",
      )}
    >
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-display text-[15px] font-bold tracking-tight text-neutral-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white shadow-[0_2px_8px_rgba(15,61,145,0.3)] transition-transform group-hover:scale-105">
            {siteConfig.initials}
          </span>
          <span className="hidden sm:inline">{siteConfig.shortName}</span>
        </Link>

        <ul className="hidden items-center gap-0.5 rounded-full border border-neutral-200/60 bg-white/70 p-1 shadow-sm backdrop-blur-md lg:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-primary"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Image
            src="/images/zimbabwe-flag.svg"
            alt="Flag of Zimbabwe"
            width={36}
            height={24}
            className="mr-1 hidden h-3.5 w-auto rounded-[3px] border border-neutral-200/70 shadow-sm sm:block"
            priority
          />

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-full border border-neutral-200/80 bg-white/80 p-2 text-neutral-600 shadow-sm backdrop-blur-sm lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-neutral-200/60 bg-white/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="flex flex-col gap-0.5 px-5 py-4">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="flex justify-end pt-3 sm:hidden">
                <Image
                  src="/images/zimbabwe-flag.svg"
                  alt="Flag of Zimbabwe"
                  width={36}
                  height={24}
                  className="mr-1 h-3.5 w-auto rounded-[3px] border border-neutral-200/70 shadow-sm"
                />
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
