"use client";

import type { User } from "firebase/auth";
import { Heart, Loader2, LogOut, Receipt } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DonateModal } from "@/components/ui/DonateModal";
import { logout } from "@/hooks/useAuth";
import { subscribeToDonationsByEmail } from "@/lib/firebase/donations";
import { getPartnerProfile } from "@/lib/firebase/partners";
import { siteConfig } from "@/lib/data";
import type { Donation } from "@/types/donation";
import {
  describeInterval,
  formatDonationAmount,
  formatDonationDate,
} from "@/types/donation";
import type { PartnerProfile } from "@/types/partner";

interface PartnerDashboardProps {
  user: User;
}

const statusStyles: Record<string, string> = {
  succeeded: "bg-accent/10 text-accent",
  pending: "bg-secondary/15 text-secondary-dark",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-neutral-100 text-neutral-500",
};

export function PartnerDashboard({ user }: PartnerDashboardProps) {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [donateOpen, setDonateOpen] = useState(false);

  const email = user.email ?? "";

  useEffect(() => {
    void getPartnerProfile(user.uid).then(setProfile);
  }, [user.uid]);

  useEffect(() => {
    const unsubscribe = subscribeToDonationsByEmail(
      email,
      (next) => {
        setDonations(next);
        setLoading(false);
      },
      () => {
        setError("Could not load your donations.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [email]);

  const totalsByCurrency = useMemo(() => {
    const totals = new Map<string, number>();
    for (const donation of donations) {
      if (donation.status !== "succeeded") {
        continue;
      }
      totals.set(
        donation.currency,
        (totals.get(donation.currency) ?? 0) + donation.amount,
      );
    }
    return Array.from(totals.entries());
  }, [donations]);

  const displayName =
    profile?.organisation || user.displayName || email || "Partner";

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Partner Portal
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-neutral-900">
              {displayName}
            </h1>
            <p className="mt-1 text-sm text-muted">{email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" onClick={() => setDonateOpen(true)}>
              <Heart className="h-4 w-4" />
              Donate
            </Button>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:border-red-200 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>

        {/* Totals */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200/70 bg-white/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Donations
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-neutral-900">
              {donations.filter((d) => d.status === "succeeded").length}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200/70 bg-white/80 p-5 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Total contributed
            </p>
            {totalsByCurrency.length === 0 ? (
              <p className="mt-1 font-display text-3xl font-bold text-neutral-900">
                —
              </p>
            ) : (
              <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
                {totalsByCurrency.map(([currency, total]) => (
                  <p
                    key={currency}
                    className="font-display text-2xl font-bold text-neutral-900"
                  >
                    {formatDonationAmount(total, currency)}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold text-neutral-900">
            Donation history
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
              {error}
            </p>
          ) : donations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/60 p-10 text-center">
              <Receipt className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
              <p className="text-sm text-muted">
                No donations yet. Make your first gift to {siteConfig.shortName}.
              </p>
              <div className="mt-4 flex justify-center">
                <Button type="button" onClick={() => setDonateOpen(true)}>
                  <Heart className="h-4 w-4" />
                  Donate now
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/80">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-neutral-200/70 text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold">Amount</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => (
                    <tr
                      key={donation.id}
                      className="border-b border-neutral-100 last:border-0"
                    >
                      <td className="px-5 py-3 text-neutral-700">
                        {formatDonationDate(donation.createdAt)}
                      </td>
                      <td className="px-5 py-3 font-semibold text-neutral-900">
                        {formatDonationAmount(
                          donation.amount,
                          donation.currency,
                        )}
                      </td>
                      <td className="px-5 py-3 text-neutral-600">
                        {describeInterval(donation.interval)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                            statusStyles[donation.status] ??
                            "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {donation.receiptUrl ? (
                          <a
                            href={donation.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <DonateModal
        open={donateOpen}
        onClose={() => setDonateOpen(false)}
        title="Make a donation"
        defaultName={profile?.organisation ?? user.displayName ?? ""}
        defaultEmail={email}
        partnerId={user.uid}
        lockEmail={Boolean(email)}
      />
    </div>
  );
}
