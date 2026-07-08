"use client";

import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  /** Alternate background for visual rhythm */
  variant?: "default" | "muted" | "dark" | "primary";
}

const variantStyles = {
  default: "bg-neutral-50 dark:bg-neutral-950",
  muted: "bg-white dark:bg-neutral-900",
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
    <section id={id} className={cn("relative py-20 md:py-28", variantStyles[variant], className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
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
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "mx-auto max-w-3xl text-center",
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-3 text-sm font-semibold uppercase tracking-widest",
            light ? "text-secondary" : "text-accent",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl",
          light ? "text-white" : "text-neutral-900 dark:text-white",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-lg leading-relaxed md:text-xl",
            light
              ? "text-white/80"
              : "text-neutral-600 dark:text-neutral-400",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
