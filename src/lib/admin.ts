import { doc, getDoc } from "firebase/firestore";
import { getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";

const ADMINS_COLLECTION = "admins";

/**
 * Admin access is granted solely by an `admins/{uid}` document with
 * `role == "admin"`. This mirrors the `isAdmin()` check in firestore.rules, so
 * the UI can never show more than the database will actually serve.
 *
 * Never grant admin from an email allowlist: partner/donor accounts are
 * self-registered with an arbitrary email, so an email check would let a donor
 * claim admin simply by signing up with the right address.
 */
export async function checkIsAdmin(uid: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !uid) {
    return false;
  }

  try {
    const db = getClientFirestore();
    const snapshot = await getDoc(doc(db, ADMINS_COLLECTION, uid));

    if (!snapshot.exists()) {
      return false;
    }

    return snapshot.data().role === "admin";
  } catch {
    return false;
  }
}

export async function resolveAdminAccess(uid: string): Promise<boolean> {
  return checkIsAdmin(uid);
}
