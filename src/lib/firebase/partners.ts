import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { getClientAuth, getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { PartnerProfile } from "@/types/partner";

const PARTNERS_COLLECTION = "partners";

export type RegisterPartnerResult =
  | { ok: true; uid: string }
  | { ok: false; error: string };

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function registerPartner(input: {
  organisation: string;
  name: string;
  email: string;
  password: string;
}): Promise<RegisterPartnerResult> {
  if (!isFirebaseConfigured()) {
    return { ok: false, error: "Sign-up is not available right now." };
  }

  const organisation = input.organisation.trim();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!organisation) {
    return { ok: false, error: "Please enter your organisation name." };
  }

  if (!isValidEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  if (input.password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  try {
    const auth = getClientAuth();
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      input.password,
    );

    if (name) {
      await updateProfile(credential.user, { displayName: name });
    }

    const db = getClientFirestore();
    await setDoc(doc(db, PARTNERS_COLLECTION, credential.user.uid), {
      organisation,
      name,
      email,
      createdAt: serverTimestamp(),
    });

    return { ok: true, uid: credential.user.uid };
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error
        ? String((error as { code: unknown }).code)
        : "";

    if (code === "auth/email-already-in-use") {
      return {
        ok: false,
        error: "An account with this email already exists. Please sign in.",
      };
    }

    if (code === "auth/weak-password") {
      return { ok: false, error: "Please choose a stronger password." };
    }

    return { ok: false, error: "Could not create your account. Try again." };
  }
}

export async function getPartnerProfile(
  uid: string,
): Promise<PartnerProfile | null> {
  if (!isFirebaseConfigured()) {
    return null;
  }

  try {
    const db = getClientFirestore();
    const snapshot = await getDoc(doc(db, PARTNERS_COLLECTION, uid));

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    const createdAt = data.createdAt;

    return {
      id: uid,
      organisation: String(data.organisation ?? ""),
      name: String(data.name ?? ""),
      email: String(data.email ?? ""),
      createdAt: createdAt instanceof Timestamp ? createdAt.toDate() : null,
    };
  } catch {
    return null;
  }
}
