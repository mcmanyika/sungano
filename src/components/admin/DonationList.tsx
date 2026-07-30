"use client";

import { HandCoins, Loader2, Repeat } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DonationCharts } from "@/components/admin/DonationCharts";
import { subscribeToAllDonations } from "@/lib/firebase/donations";
import { cardSurface } from "@/lib/styles";
import {
  describeInterval,
  formatDonationAmount,
  formatDonationDate,
  type Donation,
} from "@/types/donation";

const statusStyles: Record<string, string> = {
  succeeded: "bg-accent/10 text-accent",
  pending: "bg-secondary/15 text-secondary-dark",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-neutral-100 text-neutral-500",
};

export function DonationList() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToAllDonations(
      (next) => {
        setDonations(next);
        setLoading(false);
      },
      () => {
        setError("Unable to load donations.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return donations;
    }
    return donations.filter(
      (donation) =>
        donation.email.toLowerCase().includes(query) ||
        donation.donorName.toLowerCase().includes(query),
    );
  }, [search, donations]);

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

  const recurringCount = useMemo(
    () => donations.filter((donation) => donation.recurring).length,
    [donations],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          Donations
        </h2>
        <p className="mt-1 text-sm text-muted">
          Gifts received through Stripe checkout.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className={`p-5 ${cardSurface} rounded-2xl`}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HandCoins className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-muted">Total donations</p>
              <p className="font-display text-2xl font-bold text-neutral-900">
                {donations.length}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-5 ${cardSurface} rounded-2xl`}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Repeat className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-muted">Recurring</p>
              <p className="font-display text-2xl font-bold text-neutral-900">
                {recurringCount}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-5 ${cardSurface} rounded-2xl`}>
          <p className="text-sm text-muted">Raised (by currency)</p>
          {totalsByCurrency.length === 0 ? (
            <p className="mt-1 font-display text-2xl font-bold text-neutral-900">
              —
            </p>
          ) : (
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              {totalsByCurrency.map(([currency, total]) => (
                <p
                  key={currency}
                  className="font-display text-lg font-bold text-neutral-900"
                >
                  {formatDonationAmount(total, currency)}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {!loading && !error ? <DonationCharts donations={donations} /> : null}

      <div className={`p-4 ${cardSurface} rounded-2xl`}>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by donor name or email..."
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`p-8 text-center ${cardSurface} rounded-2xl`}>
          <p className="text-neutral-700">
            {search ? "No donations match your search." : "No donations yet."}
          </p>
        </div>
      ) : (
        <div className={`overflow-hidden ${cardSurface} rounded-2xl`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200/80 bg-neutral-50/80 text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Donor</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80">
                {filtered.map((donation) => (
                  <tr key={donation.id} className="text-neutral-700">
                    <td className="px-5 py-4 text-muted">
                      {formatDonationDate(donation.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-neutral-900">
                        {donation.donorName || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted">
                        {donation.email || "—"}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-neutral-900">
                      {formatDonationAmount(donation.amount, donation.currency)}
                    </td>
                    <td className="px-5 py-4">
                      {describeInterval(donation.interval)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          statusStyles[donation.status] ??
                          "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {donation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
