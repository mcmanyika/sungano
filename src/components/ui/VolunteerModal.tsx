"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { VolunteerRegisterForm } from "@/components/ui/VolunteerRegisterForm";
import { easeOut } from "@/lib/animations";

interface VolunteerModalProps {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title?: string;
  description?: string;
}

export function VolunteerModal({
  open,
  onClose,
  eyebrow = "Support the Coalition",
  title = "Volunteer registration",
  description = "Register to support Coalition programmes and peaceful, lawful constitutional work in your community.",
}: VolunteerModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[120]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="volunteer-modal-title"
        >
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-primary-dark/45 backdrop-blur-[2px]"
            aria-label="Close registration form"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-[-24px_0_60px_rgba(12,18,34,0.18)] sm:w-1/2 sm:max-w-none"
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200/80 px-5 py-5 sm:px-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                  {eyebrow}
                </p>
                <h2
                  id="volunteer-modal-title"
                  className="mt-1 font-display text-2xl font-bold tracking-tight text-neutral-900"
                >
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-neutral-200 p-2 text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
              <p className="mb-6 text-sm leading-relaxed text-muted">
                {description}
              </p>
              <VolunteerRegisterForm />
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
