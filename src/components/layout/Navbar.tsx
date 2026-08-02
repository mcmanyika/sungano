"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { usePageLoad } from "@/components/providers/PageLoadProvider";
import { useSiteNavigation } from "@/hooks/useSiteNavigation";
import { siteContainer } from "@/lib/layout";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { easeOut, slideDown } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { isNavigableHref, type SiteLink } from "@/types/navigation";

function resolveNavHref(href: string, isHome: boolean) {
  if (href.startsWith("/") || href.startsWith("http")) {
    return href;
  }

  if (href.startsWith("#")) {
    return isHome ? href : `/${href}`;
  }

  return href;
}

function pathMatchesHref(pathname: string, href: string): boolean {
  if (!isNavigableHref(href) || href.startsWith("http") || href.startsWith("#")) {
    return false;
  }

  const path = href.split("#")[0];
  if (!path) {
    return false;
  }

  return pathname === path || pathname.startsWith(`${path}/`);
}

function SiteChromeLink({
  link,
  className,
  isHome,
  onClick,
}: {
  link: SiteLink;
  className?: string;
  isHome: boolean;
  onClick?: () => void;
}) {
  if (!isNavigableHref(link.href)) {
    return <span className={className}>{link.label}</span>;
  }

  const href = resolveNavHref(link.href, isHome);
  const external = href.startsWith("http");

  if (href.startsWith("/") && !href.includes("#")) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {link.label}
      </Link>
    );
  }

  return (
    <a
      href={href}
      onClick={onClick}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {link.label}
    </a>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const scrollY = useScrollPosition();
  const { isReady } = usePageLoad();
  const { navigation } = useSiteNavigation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [menuPathname, setMenuPathname] = useState(pathname);
  const [viewportHeight, setViewportHeight] = useState(800);
  const megaRef = useRef<HTMLElement>(null);
  const megaPanelId = useId();
  const isHome = pathname === "/";
  const overHero = isHome && scrollY < viewportHeight * 0.7;
  const isSolid = !isHome || scrollY > 16 || (megaOpen && !overHero);

  const megaTrigger =
    navigation.header.find((link) => link.megaMenu) ?? navigation.header[0];
  const primaryLinks = navigation.header.filter((link) => !link.megaMenu);
  const aboutActive =
    pathMatchesHref(pathname, navigation.aboutMenu.intro.href) ||
    navigation.aboutMenu.items.some((item) =>
      pathMatchesHref(pathname, item.href),
    );

  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setMegaOpen(false);
    setMobileOpen(false);
    setMobileAboutOpen(false);
  }

  useEffect(() => {
    function updateViewportHeight() {
      setViewportHeight(window.innerHeight);
    }

    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);
    return () => window.removeEventListener("resize", updateViewportHeight);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!megaOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        megaRef.current &&
        !megaRef.current.contains(event.target as Node)
      ) {
        setMegaOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMegaOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [megaOpen]);

  return (
    <motion.header
      ref={megaRef}
      initial="hidden"
      animate={isReady ? "visible" : "hidden"}
      variants={slideDown}
      transition={{ duration: 0.65, delay: 0.05, ease: easeOut }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isSolid
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
              isSolid ? "text-neutral-900" : "text-white",
            )}
          >
            Sungano Ubumbano
          </span>
        </Link>

        <ul className="hidden items-center gap-0.5 justify-self-center rounded-full border border-neutral-200/60 bg-white/70 p-1 shadow-sm backdrop-blur-md lg:flex">
          {megaTrigger ? (
            <li>
              <button
                type="button"
                aria-expanded={megaOpen}
                aria-controls={megaPanelId}
                onClick={() => setMegaOpen((open) => !open)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  megaOpen || aboutActive
                    ? "bg-neutral-100 text-primary"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-primary",
                )}
              >
                {megaTrigger.label}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    megaOpen && "rotate-180",
                  )}
                />
              </button>
            </li>
          ) : null}

          {primaryLinks.map((link) => (
            <li key={link.id}>
              <SiteChromeLink
                link={link}
                isHome={isHome}
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-primary"
              />
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-self-end gap-2">
          <SiteChromeLink
            link={navigation.donate}
            isHome={isHome}
            className="hidden rounded-full bg-red-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-red-700 sm:px-4 lg:inline-flex"
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
        {megaOpen && (
          <div className={cn(siteContainer, "relative hidden lg:block")}>
            <motion.div
              id={megaPanelId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2, ease: easeOut }}
              className={cn(
                "absolute inset-x-0 top-3 z-50 w-full overflow-hidden rounded-2xl backdrop-blur-xl",
                overHero
                  ? "border border-white/50 bg-white/80 shadow-[0_16px_40px_-18px_rgba(10,45,107,0.28)]"
                  : "border border-neutral-200/80 bg-white shadow-[0_20px_50px_-20px_rgba(15,61,145,0.28)]",
              )}
            >
              <div
                className={cn(
                  "border-b p-3 sm:p-4",
                  overHero ? "border-primary/10" : "border-neutral-100",
                )}
              >
                <SiteChromeLink
                  link={navigation.aboutMenu.intro}
                  isHome={isHome}
                  onClick={() => setMegaOpen(false)}
                  className={cn(
                    "block rounded-xl px-3 py-3 text-sm font-semibold text-neutral-900 transition",
                    overHero ? "hover:bg-white/65" : "hover:bg-neutral-50",
                  )}
                />
              </div>

              <div
                className={cn(
                  "border-b px-5 py-3 sm:px-6",
                  overHero ? "border-primary/10" : "border-neutral-100",
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                  {navigation.aboutMenu.sectionTitle}
                </p>
                {navigation.aboutMenu.sectionDescription ? (
                  <p className="mt-1 text-sm text-muted">
                    {navigation.aboutMenu.sectionDescription}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-1 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
                {navigation.aboutMenu.items.map((item) => (
                  <SiteChromeLink
                    key={item.id}
                    link={item}
                    isHome={isHome}
                    onClick={() => setMegaOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-semibold text-neutral-900"
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-neutral-200/60 bg-white/95 px-5 backdrop-blur-xl sm:px-8 lg:hidden"
          >
            <ul className="flex flex-col gap-0.5 py-4">
              {megaTrigger ? (
                <li>
                  <button
                    type="button"
                    aria-expanded={mobileAboutOpen}
                    onClick={() => setMobileAboutOpen((open) => !open)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    {megaTrigger.label}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        mobileAboutOpen && "rotate-180",
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {mobileAboutOpen && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pl-2"
                      >
                        <li>
                          <SiteChromeLink
                            link={navigation.aboutMenu.intro}
                            isHome={isHome}
                            onClick={() => setMobileOpen(false)}
                            className="block rounded-xl px-3 py-2 text-sm font-semibold text-primary"
                          />
                        </li>
                        {navigation.aboutMenu.items.map((item) => (
                          <li key={item.id}>
                            <SiteChromeLink
                              link={item}
                              isHome={isHome}
                              onClick={() => setMobileOpen(false)}
                              className="block rounded-xl px-3 py-2 text-sm text-neutral-600"
                            />
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              ) : null}

              {primaryLinks.map((link) => (
                <li key={link.id}>
                  <SiteChromeLink
                    link={link}
                    isHome={isHome}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                  />
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
