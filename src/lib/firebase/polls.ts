import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  POLL_MAX_OPTIONS,
  POLL_MIN_OPTIONS,
  buildPollOptions,
  emptyVotesForOptions,
  type Poll,
  type PollInput,
  type PollOption,
} from "@/types/poll";

const COLLECTION = "polls";

function publishedPollsQuery(db: ReturnType<typeof getClientFirestore>) {
  return query(collection(db, COLLECTION), where("published", "==", true));
}

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
}

function mapOptions(value: unknown): PollOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const row = (item ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? `o${index}`),
      label: String(row.label ?? ""),
    };
  });
}

function mapVotes(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, count]) => [
      key,
      typeof count === "number" ? count : Number(count) || 0,
    ]),
  );
}

function mapPoll(id: string, data: DocumentData): Poll {
  return {
    id,
    question: String(data.question ?? ""),
    options: mapOptions(data.options),
    votes: mapVotes(data.votes),
    totalVotes: typeof data.totalVotes === "number" ? data.totalVotes : 0,
    published: Boolean(data.published),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function normalizeInput(input: PollInput): {
  question: string;
  options: PollOption[];
  published: boolean;
} {
  const question = input.question.trim().slice(0, 200);
  const labels = input.optionLabels
    .map((label) => label.trim().slice(0, 120))
    .filter(Boolean);

  if (
    !question ||
    labels.length < POLL_MIN_OPTIONS ||
    labels.length > POLL_MAX_OPTIONS
  ) {
    throw new Error("Invalid poll input.");
  }

  return {
    question,
    options: buildPollOptions(labels),
    published: Boolean(input.published),
  };
}

function mergeVotes(
  options: PollOption[],
  previousVotes: Record<string, number>,
): { votes: Record<string, number>; totalVotes: number } {
  const votes = emptyVotesForOptions(options);

  for (const option of options) {
    votes[option.id] = previousVotes[option.id] ?? 0;
  }

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
  return { votes, totalVotes };
}

export function subscribeToPublishedPolls(
  onData: (polls: Poll[]) => void,
  onError?: (error: Error) => void,
): () => void {
  if (!isFirebaseConfigured()) {
    onData([]);
    return () => {};
  }

  const db = getClientFirestore();

  return onSnapshot(
    publishedPollsQuery(db),
    (snapshot) => {
      const polls = snapshot.docs
        .map((document) => mapPoll(document.id, document.data()))
        .sort((a, b) => {
          const aTime = a.createdAt?.getTime() ?? 0;
          const bTime = b.createdAt?.getTime() ?? 0;
          return bTime - aTime;
        });

      onData(polls);
    },
    (error) => onError?.(error),
  );
}

export function subscribeToAllPolls(
  onData: (polls: Poll[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const db = getClientFirestore();

  return onSnapshot(
    query(collection(db, COLLECTION), orderBy("createdAt", "desc")),
    (snapshot) => {
      onData(
        snapshot.docs.map((document) => mapPoll(document.id, document.data())),
      );
    },
    (error) => onError?.(error),
  );
}

export async function getAllPolls(): Promise<Poll[]> {
  const db = getClientFirestore();
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), orderBy("createdAt", "desc")),
  );

  return snapshot.docs.map((document) =>
    mapPoll(document.id, document.data()),
  );
}

export async function getPoll(id: string): Promise<Poll | null> {
  const db = getClientFirestore();
  const snapshot = await getDoc(doc(db, COLLECTION, id));

  if (!snapshot.exists()) {
    return null;
  }

  return mapPoll(snapshot.id, snapshot.data());
}

export async function createPoll(input: PollInput): Promise<string> {
  const normalized = normalizeInput(input);
  const votes = emptyVotesForOptions(normalized.options);
  const db = getClientFirestore();

  const created = await addDoc(collection(db, COLLECTION), {
    question: normalized.question,
    options: normalized.options,
    votes,
    totalVotes: 0,
    published: normalized.published,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return created.id;
}

export async function updatePoll(id: string, input: PollInput): Promise<void> {
  const normalized = normalizeInput(input);
  const db = getClientFirestore();
  const existing = await getPoll(id);
  const { votes, totalVotes } = mergeVotes(
    normalized.options,
    existing?.votes ?? {},
  );

  await updateDoc(doc(db, COLLECTION, id), {
    question: normalized.question,
    options: normalized.options,
    votes,
    totalVotes,
    published: normalized.published,
    updatedAt: serverTimestamp(),
  });
}

export async function setPollPublished(
  id: string,
  published: boolean,
): Promise<void> {
  const db = getClientFirestore();
  await updateDoc(doc(db, COLLECTION, id), {
    published,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePoll(id: string): Promise<void> {
  const db = getClientFirestore();
  await deleteDoc(doc(db, COLLECTION, id));
}

export type CastVoteResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "not-configured" | "failed" };

export async function castVote(
  pollId: string,
  optionId: string,
): Promise<CastVoteResult> {
  if (!pollId || !/^o[0-5]$/.test(optionId)) {
    return { ok: false, reason: "invalid" };
  }

  if (!isFirebaseConfigured()) {
    return { ok: false, reason: "not-configured" };
  }

  try {
    const db = getClientFirestore();
    const pollRef = doc(db, COLLECTION, pollId);

    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(pollRef);

      if (!snapshot.exists()) {
        throw new Error("Poll not found.");
      }

      const data = snapshot.data();
      if (!data.published) {
        throw new Error("Poll is not published.");
      }

      const votes = mapVotes(data.votes);
      if (!(optionId in votes)) {
        throw new Error("Invalid option.");
      }

      const nextVotes = {
        ...votes,
        [optionId]: (votes[optionId] ?? 0) + 1,
      };
      const totalVotes =
        (typeof data.totalVotes === "number" ? data.totalVotes : 0) + 1;

      transaction.update(pollRef, {
        votes: nextVotes,
        totalVotes,
      });
    });

    return { ok: true };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
