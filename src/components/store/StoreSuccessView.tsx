"use client";

import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { siteConfig } from "@/lib/data";

function StoreSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [syncState, setSyncState] = useState<
    "idle" | "syncing" | "done" | "error"
  >(sessionId ? "syncing" : "idle");

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let cancelled = false;

    void fetch("/api/store/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (response) => {
        if (cancelled) {
          return;
        }
        setSyncState(response.ok ? "done" : "error");
      })
      .catch(() => {
        if (!cancelled) {
          setSyncState("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-5 py-24">
      <div className="w-full max-w-lg rounded-3xl border border-neutral-200/70 bg-white/80 p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
          {syncState === "syncing" ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <CheckCircle2 className="h-7 w-7" />
          )}
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900">
          Order confirmed
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Thank you for supporting {siteConfig.name}. A receipt has been sent
          to your email by Stripe.
        </p>

        {syncState === "error" && (
          <p className="mt-4 text-sm text-amber-700">
            Payment received. If you need help with fulfilment, contact us with
            your Stripe receipt.
          </p>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/store"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-light"
          >
            Back to store
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:border-primary/20 hover:text-primary"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export function StoreSuccessView() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-svh items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      }
    >
      <StoreSuccessContent />
    </Suspense>
  );
}
