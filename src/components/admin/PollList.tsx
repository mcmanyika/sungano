"use client";

import { Loader2, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { subscribeToAllPolls } from "@/lib/firebase/polls";
import { cardSurface } from "@/lib/styles";
import { formatPollDate, type Poll } from "@/types/poll";

export function PollList() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    return subscribeToAllPolls(
      (next) => {
        setPolls(next);
        setLoading(false);
      },
      () => {
        setError("Unable to load polls.");
        setLoading(false);
      },
    );
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900">
            Polls
          </h2>
          <p className="mt-1 text-sm text-muted">
            Create and publish polls for the homepage.
          </p>
        </div>

        <Button href="/admin/polls/new">
          <Plus className="h-4 w-4" />
          New poll
        </Button>
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
      ) : polls.length === 0 ? (
        <div className={`rounded-2xl p-8 text-center ${cardSurface}`}>
          <p className="text-neutral-700">No polls yet. Create your first poll.</p>
        </div>
      ) : (
        <div className={`overflow-hidden rounded-2xl ${cardSurface}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-200/80 bg-neutral-50/80 text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3">Question</th>
                  <th className="px-5 py-3">Options</th>
                  <th className="px-5 py-3">Votes</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80">
                {polls.map((poll) => (
                  <tr key={poll.id} className="text-neutral-700">
                    <td className="max-w-xs px-5 py-4 font-medium text-neutral-900">
                      {poll.question}
                    </td>
                    <td className="px-5 py-4">{poll.options.length}</td>
                    <td className="px-5 py-4">{poll.totalVotes}</td>
                    <td className="px-5 py-4 text-muted">
                      {formatPollDate(poll.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          poll.published
                            ? "rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent"
                            : "rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-muted"
                        }
                      >
                        {poll.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/polls/${poll.id}/edit`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
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
