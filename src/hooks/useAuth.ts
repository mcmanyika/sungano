"use client";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { resolveAdminAccess } from "@/lib/admin";
import { getClientAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  configured: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) {
      setAuthLoading(false);
      setAdminLoading(false);
      return;
    }

    const auth = getClientAuth();

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });
  }, [configured]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setIsAdmin(false);
      setAdminLoading(false);
      return;
    }

    let cancelled = false;
    setAdminLoading(true);

    void resolveAdminAccess(user.uid, user.email).then((allowed) => {
      if (!cancelled) {
        setIsAdmin(allowed);
        setAdminLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  return {
    user,
    loading: authLoading || adminLoading,
    isAdmin,
    configured,
  };
}

export async function loginWithEmail(email: string, password: string) {
  const auth = getClientAuth();
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function logout() {
  const auth = getClientAuth();
  await signOut(auth);
}
