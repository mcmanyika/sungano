"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createEvent, updateEvent } from "@/lib/firebase/events";
import { cardSurface } from "@/lib/styles";
import {
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
  type EventInput,
  type EventItem,
} from "@/types/event";

interface EventFormProps {
  event?: EventItem;
  onDelete?: () => Promise<void>;
}

function toInput(event?: EventItem): EventInput {
  return {
    title: event?.title ?? "",
    description: event?.description ?? "",
    location: event?.location ?? "",
    startAt: event?.startAt ?? new Date(),
    endAt: event?.endAt ?? null,
    published: event?.published ?? false,
  };
}

export function EventForm({ event, onDelete }: EventFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<EventInput>(() => toInput(event));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isEditing = Boolean(event);

  function updateField<K extends keyof EventInput>(key: K, value: EventInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(eventSubmit: FormEvent<HTMLFormElement>) {
    eventSubmit.preventDefault();
    setLoading(true);
    setError("");

    if (!form.startAt) {
      setError("Please set a start date and time.");
      setLoading(false);
      return;
    }

    try {
      if (isEditing && event) {
        await updateEvent(event.id, form);
      } else {
        await createEvent(form);
      }

      router.push("/admin/events");
      router.refresh();
    } catch {
      setError("Unable to save this event. Check your admin permissions.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!onDelete || !window.confirm("Delete this event permanently?")) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await onDelete();
      router.push("/admin/events");
      router.refresh();
    } catch {
      setError("Unable to delete this event.");
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
          Title
        </label>
        <input
          required
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Location
        </label>
        <input
          required
          value={form.location}
          onChange={(e) => updateField("location", e.target.value)}
          placeholder="Venue or city"
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Starts
          </label>
          <input
            required
            type="datetime-local"
            value={toDateTimeLocalValue(form.startAt)}
            onChange={(e) =>
              updateField("startAt", fromDateTimeLocalValue(e.target.value))
            }
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Ends <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            type="datetime-local"
            value={toDateTimeLocalValue(form.endAt)}
            onChange={(e) =>
              updateField("endAt", fromDateTimeLocalValue(e.target.value))
            }
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Description
        </label>
        <textarea
          required
          rows={5}
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          placeholder="What is this event about?"
        />
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => updateField("published", e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary/20"
        />
        <span className="text-sm font-medium text-neutral-700">
          Publish on homepage
        </span>
      </label>

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
            "Save event"
          ) : (
            "Create event"
          )}
        </Button>

        {isEditing && onDelete && (
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
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
