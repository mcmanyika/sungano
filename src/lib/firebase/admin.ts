import "server-only";
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;

function normalizePrivateKey(value: string): string {
  // Vercel / env UIs often wrap values in quotes or leave literal \n sequences.
  let key = value.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, "\n");
}

function resolveCredential() {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (projectId && clientEmail && privateKeyRaw) {
    return {
      credential: cert({
        projectId,
        clientEmail,
        privateKey: normalizePrivateKey(privateKeyRaw),
      }),
      projectId,
    };
  }

  return {
    credential: applicationDefault(),
    projectId,
  };
}

export function getAdminApp(): App {
  if (!adminApp) {
    if (getApps().length > 0) {
      adminApp = getApps()[0];
    } else {
      const { credential, projectId } = resolveCredential();
      adminApp = initializeApp({
        credential,
        ...(projectId ? { projectId } : {}),
      });
    }
  }

  return adminApp;
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}
