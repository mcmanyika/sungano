"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { ShareButtons } from "@/components/news/ShareButtons";
import { Section, SectionHeader } from "@/components/ui/Section";
import { siteConfig } from "@/lib/data";
import { castVote, subscribeToPublishedPolls } from "@/lib/firebase/polls";
import { cardSurface } from "@/lib/styles";
import {
  pollOptionPercent,
  pollVotedStorageKey,
  type Poll,
} from "@/types/poll";

function readVotedOption(pollId: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(pollVotedStorageKey(pollId));
  } catch {
    return null;
  }
}

function writeVotedOption(pollId: string, optionId: string) {
  try {
    window.localStorage.setItem(pollVotedStorageKey(pollId), optionId);
  } catch {
    // Ignore storage failures; results still update from Firestore.
  }
}

function subscribeVotedStore(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("sungano-poll-voted", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("sungano-poll-voted", onStoreChange);
  };
}

function PollCard({ poll }: { poll: Poll }) {
  const storedVote = useSyncExternalStore(
    subscribeVotedStore,
    () => readVotedOption(poll.id),
    () => null,
  );
  const [sessionVote, setSessionVote] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");
  const votedOptionId = sessionVote ?? storedVote;
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  async function handleVote(optionId: string) {
    if (votedOptionId || voting) {
      return;
    }

    setVoting(true);
    setError("");

    const result = await castVote(poll.id, optionId);

    if (!result.ok) {
      setError(
        result.reason === "not-configured"
          ? "Voting is not available right now."
          : "Unable to record your vote. Please try again.",
      );
      setVoting(false);
      return;
    }

    writeVotedOption(poll.id, optionId);
    window.dispatchEvent(new Event("sungano-poll-voted"));
    setSessionVote(optionId);
    setVoting(false);
  }

  const showResults = isClient && Boolean(votedOptionId);
  const shareUrl = `${siteConfig.url}/#poll-${poll.id}`;

  return (
    <article
      id={`poll-${poll.id}`}
      className={`scroll-mt-28 p-6 sm:p-8 ${cardSurface}`}
    >
      <h3 className="font-display text-xl font-bold text-neutral-900 md:text-2xl">
        {poll.question}
      </h3>

      {!isClient ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : showResults ? (
        <div className="mt-6 space-y-4">
          {poll.options.map((option) => {
            const percent = pollOptionPercent(
              poll.votes,
              option.id,
              poll.totalVotes,
            );
            const isChoice = votedOptionId === option.id;

            return (
              <div key={option.id}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                  <span
                    className={
                      isChoice
                        ? "font-semibold text-primary"
                        : "font-medium text-neutral-800"
                    }
                  >
                    {option.label}
                  </span>
                  <span className="shrink-0 text-muted">
                    {percent}% · {poll.votes[option.id] ?? 0}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isChoice ? "bg-primary" : "bg-primary/40"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-sm text-muted">
            {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {poll.options.map((option) => (
            <Button
              key={option.id}
              type="button"
              variant="outline"
              className="w-full justify-start rounded-xl px-4 py-3"
              disabled={voting}
              onClick={() => void handleVote(option.id)}
            >
              {voting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {option.label}
            </Button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 border-t border-neutral-200/80 pt-4">
        <ShareButtons
          url={shareUrl}
          title={poll.question}
          description={`Vote in this community poll from ${siteConfig.shortName}`}
        />
      </div>
    </article>
  );
}

export function Polls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return subscribeToPublishedPolls(
      (next) => {
        setPolls(next);
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, []);

  if (!loading && polls.length === 0) {
    return null;
  }

  return (
    <Section id="polls" className="scroll-mt-24">
      <SectionHeader
        title="Community poll"
        description="Share your view. Results update as the community votes."
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-6">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </Section>
  );
}
