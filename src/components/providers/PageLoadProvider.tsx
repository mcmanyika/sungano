"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { LoadingScreen } from "@/components/layout/LoadingScreen";

interface PageLoadContextValue {
  isReady: boolean;
  onLoadComplete: () => void;
}

const PageLoadContext = createContext<PageLoadContextValue | undefined>(
  undefined,
);

export function PageLoadProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  const onLoadComplete = useCallback(() => setIsReady(true), []);

  const value = useMemo(
    () => ({ isReady, onLoadComplete }),
    [isReady, onLoadComplete],
  );

  return (
    <PageLoadContext.Provider value={value}>
      <LoadingScreen onComplete={onLoadComplete} />
      {children}
    </PageLoadContext.Provider>
  );
}

export function usePageLoad() {
  const ctx = useContext(PageLoadContext);
  if (!ctx) {
    throw new Error("usePageLoad must be used within PageLoadProvider");
  }
  return ctx;
}
