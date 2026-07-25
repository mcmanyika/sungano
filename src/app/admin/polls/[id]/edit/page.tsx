"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PollForm } from "@/components/admin/PollForm";
import { deletePoll, getPoll } from "@/lib/firebase/polls";
import type { Poll } from "@/types/poll";

export default function AdminEditPollPage() {
  const params = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPoll() {
      setLoading(true);
      setError("");

      try {
        const nextPoll = await getPoll(params.id);

        if (!nextPoll) {
          setError("Poll not found.");
          return;
        }

        setPoll(nextPoll);
      } catch {
        setError("Unable to load this poll.");
      } finally {
        setLoading(false);
      }
    }

    void loadPoll();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!poll) {
    return (
      <p className="text-sm font-medium text-red-600" role="alert">
        {error || "Poll not found."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          Edit poll
        </h2>
        <p className="mt-1 text-sm text-muted">{poll.question}</p>
      </div>
      <PollForm poll={poll} onDelete={() => deletePoll(poll.id)} />
    </div>
  );
}
