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
    "bg-primary text-white shadow-[0_2px_8px_rgba(15,61,145,0.25)] hover:bg-primary-light hover:shadow-[0_4px_16px_rgba(15,61,145,0.3)] focus-visible:ring-primary",
  secondary:
    "bg-accent text-white shadow-[0_2px_8px_rgba(31,138,112,0.25)] hover:bg-accent-light focus-visible:ring-accent",
  gold: "bg-secondary text-neutral-900 shadow-[0_2px_8px_rgba(201,162,39,0.3)] hover:bg-secondary-light focus-visible:ring-secondary",
  outline:
    "border border-neutral-200/80 bg-white/90 text-neutral-800 backdrop-blur-sm hover:border-primary/30 hover:bg-white hover:text-primary focus-visible:ring-primary",
  ghost: "text-neutral-600 hover:bg-neutral-100 hover:text-primary",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
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
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      className={classes}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
