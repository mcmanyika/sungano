import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { firebaseConfig, isFirebaseConfigured } from "@/lib/firebase/config";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

function assertFirebaseConfigured(): void {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add your project credentials to .env.local.",
    );
  }
}

export function getFirebaseApp(): FirebaseApp {
  assertFirebaseConfigured();

  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }

  return app;
}

export function getClientAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }

  return auth;
}

export function getClientFirestore(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }

  return db;
}

export function getClientStorage(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(getFirebaseApp());
  }

  return storage;
}

export async function getClientAnalytics() {
  if (typeof window === "undefined" || !firebaseConfig.measurementId) {
    return null;
  }

  const { getAnalytics, isSupported } = await import("firebase/analytics");

  if (!(await isSupported())) {
    return null;
  }

  return getAnalytics(getFirebaseApp());
}
