"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePageLoad } from "@/components/providers/PageLoadProvider";
import { navLinks, siteConfig } from "@/lib/data";
import { siteContainer } from "@/lib/layout";
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
        className={cn(
          siteContainer,
          "grid grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]",
        )}
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3 justify-self-start sm:gap-3.5"
        >
          <Image
            src="/images/logo.jpeg"
            alt=""
            width={200}
            height={80}
            className="h-14 w-auto shrink-0 rounded-md bg-white/95 object-contain p-0.5 shadow-sm transition-transform group-hover:scale-[1.02] sm:h-16"
            style={{ width: "auto" }}
            priority
          />
          <span
            className={cn(
              "whitespace-nowrap font-display text-base font-bold leading-none tracking-tight sm:text-lg lg:text-xl",
              isScrolled ? "text-neutral-900" : "text-white",
            )}
          >
            Sungano Ubambano
          </span>
        </Link>

        <ul className="hidden items-center gap-0.5 justify-self-center rounded-full border border-neutral-200/60 bg-white/70 p-1 shadow-sm backdrop-blur-md lg:flex">
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

        <div className="flex items-center justify-self-end gap-2">
          <Image
            src="/images/zimbabwe-flag.svg"
            alt="Flag of Zimbabwe"
            width={36}
            height={24}
            className="hidden h-3.5 w-auto rounded-[3px] border border-neutral-200/70 shadow-sm sm:block"
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
            className="overflow-hidden border-t border-neutral-200/60 bg-white/95 px-5 backdrop-blur-xl sm:px-8 lg:hidden"
          >
            <ul className="flex flex-col gap-0.5 py-4">
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
                  className="h-3.5 w-auto rounded-[3px] border border-neutral-200/70 shadow-sm"
                />
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
