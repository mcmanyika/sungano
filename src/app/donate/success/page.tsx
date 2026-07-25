import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: `Thank you — ${siteConfig.shortName}`,
  description: "Thank you for supporting the Coalition.",
  robots: { index: false, follow: false },
};

export default function DonationSuccessPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-5 py-24">
      <div className="w-full max-w-lg rounded-3xl border border-neutral-200/70 bg-white/80 p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-900">
          Thank you for your gift
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Your donation to {siteConfig.name} helps fund civic education,
          community dialogues, and peaceful, lawful constitutional work. A
          receipt has been sent to your email by Stripe.
        </p>

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
