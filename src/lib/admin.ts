import { doc, getDoc } from "firebase/firestore";
import { getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";

const ADMINS_COLLECTION = "admins";

export function getAdminEmails(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  return getAdminEmails().includes(email.trim().toLowerCase());
}

export async function checkIsAdmin(uid: string): Promise<boolean> {
  if (!isFirebaseConfigured()) {
    return false;
  }

  try {
    const db = getClientFirestore();
    const snapshot = await getDoc(doc(db, ADMINS_COLLECTION, uid));

    if (!snapshot.exists()) {
      return false;
    }

    const data = snapshot.data();
    return data.role === "admin";
  } catch {
    return false;
  }
}

export async function resolveAdminAccess(
  uid: string,
  email: string | null | undefined,
): Promise<boolean> {
  const fromFirestore = await checkIsAdmin(uid);

  if (fromFirestore) {
    return true;
  }

  return isAdminEmail(email);
}
