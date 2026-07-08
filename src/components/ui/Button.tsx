"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "gold";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  children: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-light focus-visible:ring-primary",
  secondary:
    "bg-accent text-white shadow-lg shadow-accent/25 hover:bg-accent-light focus-visible:ring-accent",
  gold: "bg-secondary text-neutral-900 shadow-lg shadow-secondary/25 hover:bg-secondary-light focus-visible:ring-secondary",
  outline:
    "border-2 border-primary/20 bg-white/80 text-primary backdrop-blur-sm hover:border-primary hover:bg-primary/5 dark:bg-neutral-900/80 dark:text-white dark:hover:bg-primary/10",
  ghost:
    "text-primary hover:bg-primary/10 dark:text-white dark:hover:bg-white/10",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      className={classes}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
