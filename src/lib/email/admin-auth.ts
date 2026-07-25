import "server-only";
import { getAdminFirestore } from "@/lib/firebase/admin";

export type AdminAuthResult =
  | { ok: true; uid: string; email: string | null }
  | { ok: false; status: number; error: string };

interface IdentityToolkitLookupResponse {
  users?: Array<{
    localId?: string;
    email?: string;
    emailVerified?: boolean;
  }>;
  error?: {
    message?: string;
  };
}

/**
 * Verify a Firebase ID token without firebase-admin/auth.
 * admin/auth pulls in `jose` via jwks-rsa and breaks under Next's bundler
 * (ERR_REQUIRE_ESM). The Identity Toolkit lookup endpoint validates the token
 * using the public web API key instead.
 */
async function verifyIdTokenWithIdentityToolkit(idToken: string): Promise<{
  uid: string;
  email: string | null;
}> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not configured.");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    },
  );

  const data = (await response.json()) as IdentityToolkitLookupResponse;

  if (!response.ok || data.error || !data.users?.[0]?.localId) {
    throw new Error(data.error?.message || "Token lookup failed.");
  }

  const user = data.users[0];
  return {
    uid: user.localId!,
    email: user.email ?? null,
  };
}

export async function requireAdminFromRequest(
  request: Request,
): Promise<AdminAuthResult> {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return { ok: false, status: 401, error: "Missing auth token." };
  }

  try {
    const verified = await verifyIdTokenWithIdentityToolkit(match[1]);
    const snapshot = await getAdminFirestore()
      .collection("admins")
      .doc(verified.uid)
      .get();

    if (!snapshot.exists || snapshot.data()?.role !== "admin") {
      return { ok: false, status: 403, error: "Admin access required." };
    }

    return {
      ok: true,
      uid: verified.uid,
      email: verified.email,
    };
  } catch (error) {
    console.error("Admin auth verification failed", error);
    const message =
      error instanceof Error ? error.message : "Invalid auth token.";

    // Surface actionable Firebase Admin credential problems clearly.
    if (/private key|DECODER|PEM|credential|project/i.test(message)) {
      return {
        ok: false,
        status: 500,
        error:
          "Server Firebase Admin credentials are invalid. Check FIREBASE_ADMIN_* env vars.",
      };
    }

    return { ok: false, status: 401, error: "Invalid auth token." };
  }
}
