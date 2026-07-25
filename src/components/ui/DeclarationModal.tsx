"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { easeOut } from "@/lib/animations";
import { getDeclaration } from "@/lib/firebase/declaration";
import {
  DEFAULT_DECLARATION,
  getDeclarationModalContent,
  type Declaration,
} from "@/types/declaration";

interface DeclarationModalProps {
  open: boolean;
  onClose: () => void;
}

export function DeclarationModal({ open, onClose }: DeclarationModalProps) {
  const [declaration, setDeclaration] = useState<Declaration>({
    ...DEFAULT_DECLARATION,
    updatedAt: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    async function loadDeclaration() {
      setLoading(true);
      setError("");

      try {
        setDeclaration(await getDeclaration());
      } catch {
        setError("Unable to load the declaration.");
      } finally {
        setLoading(false);
      }
    }

    void loadDeclaration();
  }, [open]);

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

  const modalContent = getDeclarationModalContent(declaration);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="declaration-modal-title"
        >
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-primary-dark/55 backdrop-blur-[3px]"
            aria-label="Close declaration"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="relative z-10 max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/15 bg-primary-dark/75 text-white shadow-[0_24px_60px_rgba(10,45,107,0.45)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
              <h2
                id="declaration-modal-title"
                className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl"
              >
                {declaration.headline}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/20 bg-white/5 p-2 text-white/70 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(85vh-5rem)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-secondary-light" />
                </div>
              ) : error ? (
                <p className="text-sm font-medium text-red-200" role="alert">
                  {error}
                </p>
              ) : (
                <div className="whitespace-pre-wrap text-base leading-relaxed text-white/90">
                  {modalContent}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
