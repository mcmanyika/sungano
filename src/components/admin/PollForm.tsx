"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createPoll, updatePoll } from "@/lib/firebase/polls";
import { cardSurface } from "@/lib/styles";
import {
  POLL_MAX_OPTIONS,
  POLL_MIN_OPTIONS,
  type Poll,
  type PollInput,
} from "@/types/poll";

interface PollFormProps {
  poll?: Poll;
  onDelete?: () => Promise<void>;
}

function toInput(poll?: Poll): PollInput {
  return {
    question: poll?.question ?? "",
    optionLabels:
      poll?.options.map((option) => option.label) ?? ["", ""],
    published: poll?.published ?? false,
  };
}

export function PollForm({ poll, onDelete }: PollFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<PollInput>(() => toInput(poll));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isEditing = Boolean(poll);

  function updateLabel(index: number, value: string) {
    setForm((current) => {
      const optionLabels = [...current.optionLabels];
      optionLabels[index] = value;
      return { ...current, optionLabels };
    });
  }

  function addOption() {
    setForm((current) => {
      if (current.optionLabels.length >= POLL_MAX_OPTIONS) {
        return current;
      }

      return {
        ...current,
        optionLabels: [...current.optionLabels, ""],
      };
    });
  }

  function removeOption(index: number) {
    setForm((current) => {
      if (current.optionLabels.length <= POLL_MIN_OPTIONS) {
        return current;
      }

      return {
        ...current,
        optionLabels: current.optionLabels.filter((_, i) => i !== index),
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const labels = form.optionLabels.map((label) => label.trim()).filter(Boolean);

    if (
      !form.question.trim() ||
      labels.length < POLL_MIN_OPTIONS ||
      labels.length > POLL_MAX_OPTIONS
    ) {
      setError(`Add a question and ${POLL_MIN_OPTIONS}–${POLL_MAX_OPTIONS} options.`);
      setLoading(false);
      return;
    }

    try {
      const payload: PollInput = {
        question: form.question,
        optionLabels: labels,
        published: form.published,
      };

      if (isEditing && poll) {
        await updatePoll(poll.id, payload);
      } else {
        await createPoll(payload);
      }

      router.push("/admin/polls");
      router.refresh();
    } catch {
      setError("Unable to save this poll. Check your admin permissions.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!onDelete || !window.confirm("Delete this poll permanently?")) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await onDelete();
      router.push("/admin/polls");
      router.refresh();
    } catch {
      setError("Unable to delete this poll.");
      setDeleting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-6 rounded-2xl p-6 ${cardSurface}`}
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Question
        </label>
        <input
          required
          maxLength={200}
          value={form.question}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              question: event.target.value,
            }))
          }
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          placeholder="What should we ask the community?"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-medium text-neutral-700">
            Options ({POLL_MIN_OPTIONS}–{POLL_MAX_OPTIONS})
          </label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addOption}
            disabled={form.optionLabels.length >= POLL_MAX_OPTIONS}
          >
            <Plus className="h-4 w-4" />
            Add option
          </Button>
        </div>

        {form.optionLabels.map((label, index) => (
          <div key={index} className="flex gap-2">
            <input
              required
              maxLength={120}
              value={label}
              onChange={(event) => updateLabel(index, event.target.value)}
              className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              placeholder={`Option ${index + 1}`}
            />
            {form.optionLabels.length > POLL_MIN_OPTIONS && (
              <Button
                type="button"
                variant="outline"
                className="shrink-0 border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => removeOption(index)}
                aria-label={`Remove option ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              published: event.target.checked,
            }))
          }
          className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary/20"
        />
        <span className="text-sm font-medium text-neutral-700">
          Publish on homepage
        </span>
      </label>

      {isEditing && poll && (
        <p className="text-sm text-muted">
          Current votes: {poll.totalVotes}. Editing option labels keeps existing
          counts for matching option slots; removing options drops their votes.
        </p>
      )}

      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving
            </>
          ) : isEditing ? (
            "Save poll"
          ) : (
            "Create poll"
          )}
        </Button>

        {isEditing && onDelete && (
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
