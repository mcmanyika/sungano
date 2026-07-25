"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/data";
import { cardSurface } from "@/lib/styles";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") ?? "").trim().toLowerCase();
  const token = (searchParams.get("token") ?? "").trim();

  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const canSubmit = Boolean(email && token);

  async function handleUnsubscribe() {
    if (!canSubmit) {
      setStatus("error");
      setMessage("This unsubscribe link is incomplete.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Could not unsubscribe. Please try again.");
        return;
      }

      setStatus("done");
      setMessage(
        `${email} has been removed from the ${siteConfig.shortName} mailing list.`,
      );
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-5 py-24">
      <div className={`w-full max-w-md p-8 ${cardSurface} rounded-2xl`}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Mailing list
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-neutral-900">
          {status === "done" ? "You are unsubscribed" : "Unsubscribe"}
        </h1>

        {status === "done" ? (
          <>
            <div className="mt-5 flex items-start gap-3 rounded-xl bg-accent/10 p-4 text-sm text-accent">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{message}</p>
            </div>
            <div className="mt-6">
              <Button href="/" className="w-full">
                Back to home
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {canSubmit
                ? `Stop receiving updates from ${siteConfig.shortName} at:`
                : `Open the unsubscribe link from a ${siteConfig.shortName} email to remove yourself from the mailing list.`}
            </p>

            {canSubmit && (
              <p className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-800">
                {email}
              </p>
            )}

            {message && (
              <p
                className={`mt-4 text-sm font-medium ${
                  status === "error" ? "text-red-600" : "text-muted"
                }`}
                role={status === "error" ? "alert" : "status"}
              >
                {message}
              </p>
            )}

            <div className="mt-6 space-y-3">
              {canSubmit && (
                <Button
                  type="button"
                  className="w-full"
                  disabled={status === "loading"}
                  onClick={() => void handleUnsubscribe()}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Unsubscribing
                    </>
                  ) : (
                    "Unsubscribe me"
                  )}
                </Button>
              )}
              <Link
                href="/"
                className="block text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Keep receiving updates
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export function UnsubscribePageView() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-svh items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
