"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { easeOut } from "@/lib/animations";
import { formatTweetDate, X_USERNAME, type LatestTweet } from "@/types/x";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface LatestTweetResponse {
  tweet: LatestTweet | null;
  configured: boolean;
  reason?: "not-configured" | "credits" | "unavailable" | "empty" | null;
}

function errorMessage(reason?: LatestTweetResponse["reason"]) {
  switch (reason) {
    case "credits":
      return "X API credits are depleted. Add credits in the X Developer Console to show posts here.";
    case "not-configured":
      return "X updates are not configured yet.";
    case "empty":
      return "No recent posts are available from this account.";
    default:
      return "Unable to load the latest post from X right now.";
  }
}

interface LatestTweetModalProps {
  open: boolean;
  onClose: () => void;
}

export function LatestTweetModal({ open, onClose }: LatestTweetModalProps) {
  const [tweet, setTweet] = useState<LatestTweet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadTweet() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/latest-tweet");
        const payload = (await response.json()) as LatestTweetResponse;

        if (cancelled) {
          return;
        }

        setTweet(payload.tweet);

        if (!payload.tweet) {
          setError(errorMessage(payload.reason));
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load the latest post from X.");
          setTweet(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTweet();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const profileUrl = `https://x.com/${X_USERNAME}`;

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="latest-tweet-title"
        >
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-primary-dark/55 backdrop-blur-[3px]"
            aria-label="Close latest post"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-primary-dark/75 text-white shadow-[0_24px_60px_rgba(10,45,107,0.45)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
                  <XIcon className="h-4 w-4" />
                </span>
                <div>
                  <p
                    id="latest-tweet-title"
                    className="font-display text-base font-bold text-white"
                  >
                    Latest from X
                  </p>
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/65 transition hover:text-secondary-light"
                  >
                    @{X_USERNAME}
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/20 bg-white/5 p-2 text-white/70 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 py-5 sm:px-6 sm:py-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-7 w-7 animate-spin text-secondary-light" />
                </div>
              ) : error || !tweet ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-red-200">
                    {error || "No recent posts available."}
                  </p>
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-secondary-light"
                  >
                    View profile on X
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              ) : (
                <>
                  {tweet.createdAt && (
                    <time
                      dateTime={tweet.createdAt}
                      className="text-xs text-white/55"
                    >
                      {formatTweetDate(tweet.createdAt)}
                    </time>
                  )}
                  <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-white/90">
                    {tweet.text}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <p className="text-xs text-white/55">
                      {tweet.likeCount} likes · {tweet.retweetCount} reposts ·{" "}
                      {tweet.replyCount} replies
                    </p>
                    <a
                      href={tweet.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-light transition hover:text-secondary"
                    >
                      View on X
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
