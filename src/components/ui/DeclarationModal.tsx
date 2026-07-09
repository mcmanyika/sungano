"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getDeclaration } from "@/lib/firebase/declaration";
import { cardSurface } from "@/lib/styles";
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="declaration-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close declaration"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`relative z-10 max-h-[85vh] w-full max-w-4xl overflow-hidden ${cardSurface} rounded-2xl`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200/80 px-6 py-5">
              <h2
                id="declaration-modal-title"
                className="font-display text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl"
              >
                {declaration.headline}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition hover:border-neutral-300 hover:text-neutral-900"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[calc(85vh-5rem)] overflow-y-auto px-6 py-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <p className="text-sm font-medium text-red-600" role="alert">
                  {error}
                </p>
              ) : (
                <div className="whitespace-pre-wrap text-base leading-relaxed text-neutral-700">
                  {modalContent}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
