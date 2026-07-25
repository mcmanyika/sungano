import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { Comment, CommentInput } from "@/types/comment";

const COLLECTION = "comments";

export type CommentCreateResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "not-configured" | "failed" };

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mapComment(id: string, data: Record<string, unknown>): Comment {
  const createdAt = data.createdAt;

  return {
    id,
    articleId: String(data.articleId ?? ""),
    articleTitle: String(data.articleTitle ?? ""),
    authorName: String(data.authorName ?? ""),
    email: String(data.email ?? ""),
    body: String(data.body ?? ""),
    approved: Boolean(data.approved),
    createdAt: createdAt instanceof Timestamp ? createdAt.toDate() : null,
  };
}

export async function createComment(
  input: CommentInput,
): Promise<CommentCreateResult> {
  const articleId = input.articleId.trim();
  const articleTitle = input.articleTitle.trim().slice(0, 200);
  const authorName = input.authorName.trim().slice(0, 80);
  const email = input.email.trim().toLowerCase();
  const body = input.body.trim().slice(0, 2000);

  if (
    !articleId ||
    !authorName ||
    !body ||
    body.length < 2 ||
    !isValidEmail(email)
  ) {
    return { ok: false, reason: "invalid" };
  }

  if (!isFirebaseConfigured()) {
    return { ok: false, reason: "not-configured" };
  }

  try {
    const db = getClientFirestore();
    await addDoc(collection(db, COLLECTION), {
      articleId,
      articleTitle,
      authorName,
      email,
      body,
      approved: false,
      createdAt: serverTimestamp(),
    });

    return { ok: true };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

export function subscribeToApprovedComments(
  articleId: string,
  onData: (comments: Comment[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const db = getClientFirestore();
  const commentsQuery = query(
    collection(db, COLLECTION),
    where("articleId", "==", articleId),
    where("approved", "==", true),
  );

  return onSnapshot(
    commentsQuery,
    (snapshot) => {
      const comments = snapshot.docs.map((document) =>
        mapComment(document.id, document.data()),
      );

      comments.sort((a, b) => {
        const aTime = a.createdAt?.getTime() ?? 0;
        const bTime = b.createdAt?.getTime() ?? 0;
        return bTime - aTime;
      });

      onData(comments);
    },
    (error) => onError?.(error),
  );
}

export async function getAllComments(): Promise<Comment[]> {
  const db = getClientFirestore();
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), orderBy("createdAt", "desc")),
  );

  return snapshot.docs.map((document) =>
    mapComment(document.id, document.data()),
  );
}

export function subscribeToAllComments(
  onData: (comments: Comment[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const db = getClientFirestore();
  const commentsQuery = query(
    collection(db, COLLECTION),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    commentsQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((document) =>
          mapComment(document.id, document.data()),
        ),
      );
    },
    (error) => onError?.(error),
  );
}

export async function setCommentApproved(
  id: string,
  approved: boolean,
): Promise<void> {
  const db = getClientFirestore();
  await updateDoc(doc(db, COLLECTION, id), { approved });
}

export async function deleteComment(id: string): Promise<void> {
  const db = getClientFirestore();
  await deleteDoc(doc(db, COLLECTION, id));
}
