export const POLL_MIN_OPTIONS = 2;
export const POLL_MAX_OPTIONS = 6;

export interface PollOption {
  id: string;
  label: string;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  votes: Record<string, number>;
  totalVotes: number;
  published: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface PollInput {
  question: string;
  /** Option labels only; ids `o0`… are assigned on save. */
  optionLabels: string[];
  published: boolean;
}

export function optionIdAt(index: number): string {
  return `o${index}`;
}

export function buildPollOptions(labels: string[]): PollOption[] {
  return labels.map((label, index) => ({
    id: optionIdAt(index),
    label: label.trim(),
  }));
}

export function emptyVotesForOptions(options: PollOption[]): Record<string, number> {
  return Object.fromEntries(options.map((option) => [option.id, 0]));
}

export function pollOptionPercent(
  votes: Record<string, number>,
  optionId: string,
  totalVotes: number,
): number {
  if (totalVotes <= 0) {
    return 0;
  }

  return Math.round(((votes[optionId] ?? 0) / totalVotes) * 100);
}

export function formatPollDate(date: Date | null): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function pollVotedStorageKey(pollId: string): string {
  return `sungano-poll-voted:${pollId}`;
}
