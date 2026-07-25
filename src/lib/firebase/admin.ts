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

function resolveCredential() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    return cert({
      projectId,
      clientEmail,
      // Support keys stored with escaped newlines in env files.
      privateKey: privateKey.replace(/\\n/g, "\n"),
    });
  }

  // Fall back to Application Default Credentials (Firebase App Hosting / Cloud Run).
  return applicationDefault();
}

export function getAdminApp(): App {
  if (!adminApp) {
    adminApp =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({ credential: resolveCredential() });
  }

  return adminApp;
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}
