"use client";

import { Loader2, Mail, RefreshCw, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getAllSubscribers } from "@/lib/firebase/subscribers";
import { cardSurface } from "@/lib/styles";
import { formatSubscriberDate, type Subscriber } from "@/types/subscriber";

export function SubscriberList() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadSubscribers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setSubscribers(await getAllSubscribers());
    } catch {
      setError("Unable to load subscribers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubscribers();
  }, [loadSubscribers]);

  const filteredSubscribers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return subscribers;
    }

    return subscribers.filter(
      (subscriber) =>
        subscriber.email.toLowerCase().includes(query) ||
        subscriber.source.toLowerCase().includes(query),
    );
  }, [search, subscribers]);

  const sourceCounts = useMemo(() => {
    return subscribers.reduce<Record<string, number>>((counts, subscriber) => {
      counts[subscriber.source] = (counts[subscriber.source] ?? 0) + 1;
      return counts;
    }, {});
  }, [subscribers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900">
            Subscribers
          </h2>
          <p className="mt-1 text-sm text-muted">
            Email signups from the website.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => loadSubscribers()}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className={`p-5 ${cardSurface} rounded-2xl`}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-muted">Total subscribers</p>
              <p className="font-display text-2xl font-bold text-neutral-900">
                {subscribers.length}
              </p>
            </div>
          </div>
        </div>

        {Object.entries(sourceCounts).map(([source, count]) => (
          <div key={source} className={`p-5 ${cardSurface} rounded-2xl`}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm capitalize text-muted">
                  {source.replace(/-/g, " ")}
                </p>
                <p className="font-display text-2xl font-bold text-neutral-900">
                  {count}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`p-4 ${cardSurface} rounded-2xl`}>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by email or source..."
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
      ) : filteredSubscribers.length === 0 ? (
        <div className={`p-8 text-center ${cardSurface} rounded-2xl`}>
          <p className="text-neutral-700">
            {search ? "No subscribers match your search." : "No subscribers yet."}
          </p>
        </div>
      ) : (
        <div className={`overflow-hidden ${cardSurface} rounded-2xl`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200/80 bg-neutral-50/80 text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="text-neutral-700">
                    <td className="px-5 py-4 font-medium text-neutral-900">
                      {subscriber.email}
                    </td>
                    <td className="px-5 py-4 capitalize">
                      {subscriber.source.replace(/-/g, " ")}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {formatSubscriberDate(subscriber.subscribedAt)}
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
