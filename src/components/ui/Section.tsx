"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { siteContainer } from "@/lib/layout";
import { easeOut } from "@/lib/animations";

interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "muted" | "dark" | "primary";
}

const variantStyles = {
  default: "bg-transparent",
  muted: "bg-white/50 backdrop-blur-sm",
  dark: "bg-primary text-white",
  primary:
    "bg-gradient-to-br from-primary via-primary to-primary-dark text-white",
};

export function Section({
  id,
  className,
  children,
  variant = "default",
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("relative py-24 md:py-32", variantStyles[variant], className)}
    >
      <div className={siteContainer}>{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  light = false,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, ease: easeOut }}
      className={cn(
        "mb-14 md:mb-16",
        align === "center" && "mx-auto max-w-2xl text-center",
      )}
    >
      {eyebrow && (
        <div className={cn(align === "center" && "flex justify-center")}>
          <span
            className={cn(
              "eyebrow-pill mb-5",
              light && "border-secondary/30 bg-secondary/10 text-secondary",
            )}
          >
            {eyebrow}
          </span>
        </div>
      )}
      <h2
        className={cn(
          "font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-[1.15]",
          light ? "text-white" : "text-neutral-900",
        )}
      >
        {title}
      </h2>
      <div
        className={cn(
          "mt-5 h-px w-12 bg-secondary",
          align === "center" && "mx-auto",
        )}
        aria-hidden
      />
      {description && (
        <p
          className={cn(
            "mt-5 text-base leading-relaxed md:text-lg",
            light ? "text-white/75" : "text-muted",
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
