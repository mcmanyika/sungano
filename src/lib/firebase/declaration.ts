import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  DEFAULT_DECLARATION,
  type Declaration,
  type DeclarationInput,
} from "@/types/declaration";

const DECLARATION_DOC = "content/declaration";

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
}

function mapDeclaration(data: Record<string, unknown>): Declaration {
  return {
    headline: String(data.headline ?? DEFAULT_DECLARATION.headline),
    message: String(data.message ?? DEFAULT_DECLARATION.message),
    body: String(data.body ?? DEFAULT_DECLARATION.body),
    updatedAt: toDate(data.updatedAt),
  };
}

export function getDefaultDeclaration(): Declaration {
  return {
    ...DEFAULT_DECLARATION,
    updatedAt: null,
  };
}

export async function getDeclaration(): Promise<Declaration> {
  if (!isFirebaseConfigured()) {
    return getDefaultDeclaration();
  }

  try {
    const db = getClientFirestore();
    const snapshot = await getDoc(doc(db, DECLARATION_DOC));

    if (!snapshot.exists()) {
      return getDefaultDeclaration();
    }

    return mapDeclaration(snapshot.data());
  } catch {
    return getDefaultDeclaration();
  }
}

export function subscribeToDeclaration(
  onData: (declaration: Declaration) => void,
  onError?: (error: Error) => void,
): () => void {
  const db = getClientFirestore();

  return onSnapshot(
    doc(db, DECLARATION_DOC),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(getDefaultDeclaration());
        return;
      }

      onData(mapDeclaration(snapshot.data()));
    },
    (error) => onError?.(error),
  );
}

export async function saveDeclaration(input: DeclarationInput): Promise<void> {
  const db = getClientFirestore();

  await setDoc(
    doc(db, DECLARATION_DOC),
    {
      headline: input.headline.trim(),
      message: input.message.trim(),
      body: input.body.trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
