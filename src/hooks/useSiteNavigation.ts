"use client";

import { useEffect, useState } from "react";
import {
  getDefaultSiteNavigation,
  subscribeToSiteNavigation,
} from "@/lib/firebase/navigation";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { SiteNavigation } from "@/types/navigation";

export function useSiteNavigation() {
  const [navigation, setNavigation] = useState<SiteNavigation>(
    getDefaultSiteNavigation,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setNavigation(getDefaultSiteNavigation());
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToSiteNavigation(
      (next) => {
        setNavigation(next);
        setLoading(false);
      },
      () => {
        setNavigation(getDefaultSiteNavigation());
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return { navigation, loading };
}
