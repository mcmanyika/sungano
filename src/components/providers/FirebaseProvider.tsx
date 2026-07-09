"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getClientAnalytics, getFirebaseApp } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";

interface FirebaseContextValue {
  configured: boolean;
  ready: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  configured: false,
  ready: false,
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const configured = isFirebaseConfigured();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!configured) {
      return;
    }

    getFirebaseApp();
    void getClientAnalytics();
    setReady(true);
  }, [configured]);

  const value = useMemo(
    () => ({
      configured,
      ready,
    }),
    [configured, ready],
  );

  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
}

export function useFirebase() {
  return useContext(FirebaseContext);
}
