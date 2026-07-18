"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { easeOut } from "@/lib/animations";
import { cardSurface } from "@/lib/styles";
import { cn } from "@/lib/utils";
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
    case "empty":
      return "No recent posts are available from this account.";
    default:
      return "Unable to load the latest post from X right now.";
  }
}

export function LatestFromX() {
  const [tweet, setTweet] = useState<LatestTweet | null>(null);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

        setConfigured(payload.configured);
        setTweet(payload.tweet);

        if (payload.configured && !payload.tweet) {
          setError(errorMessage(payload.reason));
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load the latest post from X.");
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
  }, []);

  const profileUrl = `https://x.com/${X_USERNAME}`;

  return (
    <Section id="x" variant="default">
      <SectionHeader
        eyebrow="On X"
        title="Latest from X"
        description={`Follow @${X_USERNAME} for timely updates from the Coalition.`}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.55, ease: easeOut }}
        className="mx-auto max-w-2xl"
      >
        {loading ? (
          <div className={cn(cardSurface, "flex justify-center py-14")}>
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : !configured ? (
          <div className={cn(cardSurface, "p-8 text-center")}>
            <p className="text-sm text-muted">
              X updates are not configured yet. Follow{" "}
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                @{X_USERNAME}
              </a>{" "}
              on X.
            </p>
          </div>
        ) : error || !tweet ? (
          <div className={cn(cardSurface, "p-8 text-center")}>
            <p className="text-sm font-medium text-red-600">
              {error || "No recent posts available."}
            </p>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
            >
              View profile on X
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <article className={cn(cardSurface, "p-6 sm:p-8")}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white">
                  <XIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-neutral-900">
                    Sungano Ubumbano
                  </p>
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted transition hover:text-primary"
                  >
                    @{tweet.username}
                  </a>
                </div>
              </div>
              {tweet.createdAt && (
                <time
                  dateTime={tweet.createdAt}
                  className="shrink-0 text-xs text-muted"
                >
                  {formatTweetDate(tweet.createdAt)}
                </time>
              )}
            </div>

            <p className="mt-5 whitespace-pre-wrap text-base leading-relaxed text-neutral-800">
              {tweet.text}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200/80 pt-4">
              <p className="text-xs text-muted">
                {tweet.likeCount} likes · {tweet.retweetCount} reposts ·{" "}
                {tweet.replyCount} replies
              </p>
              <a
                href={tweet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:text-primary-light"
              >
                View on X
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </article>
        )}
      </motion.div>
    </Section>
  );
}
