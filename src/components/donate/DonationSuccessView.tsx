"use client";

import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { siteConfig } from "@/lib/data";

function DonationSuccessContent() {
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

    void fetch("/api/donations/sync", {
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
          Thank you for your gift
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Your donation to {siteConfig.name} helps fund civic education,
          community dialogues, and peaceful, lawful constitutional work. A
          receipt has been sent to your email by Stripe.
        </p>

        {syncState === "error" && (
          <p className="mt-4 text-sm text-amber-700">
            Payment received. If it doesn&apos;t appear in your partner
            dashboard yet, refresh in a minute or contact support with your
            receipt.
          </p>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/partner"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-light"
          >
            View your donations
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-700 transition hover:border-primary/30 hover:text-primary"
          >
            Back to home
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted">
          Donations are linked to your partner account when you sign in with the
          same email address you used at checkout.
        </p>
      </div>
    </main>
  );
}

export function DonationSuccessView() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-svh items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      }
    >
      <DonationSuccessContent />
    </Suspense>
  );
}
