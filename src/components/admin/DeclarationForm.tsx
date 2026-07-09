"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  getDeclaration,
  saveDeclaration,
} from "@/lib/firebase/declaration";
import { cardSurface } from "@/lib/styles";
import {
  DEFAULT_DECLARATION,
  type DeclarationInput,
} from "@/types/declaration";

export function DeclarationForm() {
  const [form, setForm] = useState<DeclarationInput>(DEFAULT_DECLARATION);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadDeclaration() {
      setLoading(true);
      setError("");

      try {
        const declaration = await getDeclaration();
        setForm({
          headline: declaration.headline,
          message: declaration.message,
          body: declaration.body,
        });
      } catch {
        setError("Unable to load the declaration message.");
      } finally {
        setLoading(false);
      }
    }

    void loadDeclaration();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await saveDeclaration(form);
      setSuccess("Declaration message saved.");
    } catch {
      setError("Unable to save the declaration. Check your admin permissions.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 p-6 ${cardSurface} rounded-2xl`}>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Headline
        </label>
        <input
          required
          value={form.headline}
          onChange={(event) =>
            setForm((current) => ({ ...current, headline: event.target.value }))
          }
          placeholder="Restore the Constitution:"
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Declaration message
        </label>
        <textarea
          required
          rows={6}
          value={form.message}
          onChange={(event) =>
            setForm((current) => ({ ...current, message: event.target.value }))
          }
          placeholder="Justice in the Courts.&#10;Sovereignty with the People.&#10;Peacefully. Lawfully. Together."
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <p className="mt-2 text-xs text-muted">
          Use a new line for each sentence. These lines appear below the headline on
          the homepage declaration section.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Full declaration
        </label>
        <textarea
          rows={12}
          value={form.body}
          onChange={(event) =>
            setForm((current) => ({ ...current, body: event.target.value }))
          }
          placeholder="Enter the full Harare Declaration text shown in the Read the Declaration modal..."
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <p className="mt-2 text-xs text-muted">
          Shown when visitors click Read the Declaration on the hero section. If
          empty, the short declaration message above is used instead.
        </p>
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm font-medium text-accent" role="status">
          {success}
        </p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving
          </>
        ) : (
          "Save declaration"
        )}
      </Button>
    </form>
  );
}
