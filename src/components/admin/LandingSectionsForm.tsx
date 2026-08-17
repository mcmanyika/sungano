"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getDonationCampaign,
  saveDonationCampaign,
} from "@/lib/firebase/donation-campaign";
import {
  getLandingSections,
  saveLandingSections,
} from "@/lib/firebase/landing-sections";
import { cardSurface } from "@/lib/styles";
import { cn } from "@/lib/utils";
import {
  LANDING_SECTION_IDS,
  LANDING_SECTION_META,
  type LandingSectionId,
  type LandingSections,
} from "@/types/landing-sections";

export function LandingSectionsForm() {
  const [sections, setSections] = useState<LandingSections | null>(null);
  const [togglingId, setTogglingId] = useState<LandingSectionId | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadSections() {
      setError("");

      try {
        setSections(await getLandingSections());
      } catch {
        setError("Unable to load landing page sections.");
      }
    }

    void loadSections();
  }, []);

  async function handleToggle(id: LandingSectionId) {
    if (!sections) {
      return;
    }

    const nextVisible = !sections[id];
    const next = { ...sections, [id]: nextVisible };
    setTogglingId(id);
    setError("");
    setSuccess("");

    try {
      await saveLandingSections(next);

      if (id === "donationTracker") {
        const campaign = await getDonationCampaign();
        await saveDonationCampaign({
          title: campaign.title,
          description: campaign.description,
          goal: campaign.goal,
          currency: campaign.currency,
          published: nextVisible,
        });
      }

      setSections(next);
      setSuccess(
        nextVisible
          ? `${LANDING_SECTION_META[id].label} is now visible on the landing page.`
          : `${LANDING_SECTION_META[id].label} is hidden from the landing page.`,
      );
    } catch (cause) {
      const code =
        cause &&
        typeof cause === "object" &&
        "code" in cause &&
        typeof cause.code === "string"
          ? cause.code
          : "";
      setError(
        code === "permission-denied"
          ? "Permission denied. Deploy Firestore rules, then try again."
          : "Unable to update landing page visibility.",
      );
    } finally {
      setTogglingId(null);
    }
  }

  if (!sections) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 p-6 ${cardSurface}`}>
      <div>
        <h3 className="font-display text-lg font-bold text-neutral-900">
          Show on landing page
        </h3>
        <p className="mt-1 text-sm text-muted">
          Turn each homepage section on or off. Hidden sections are removed for
          visitors until you enable them again.
        </p>
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm font-medium text-accent" role="status">
          {success}
        </p>
      ) : null}

      <div className="divide-y divide-neutral-200/80 overflow-hidden rounded-2xl border border-neutral-200">
        {LANDING_SECTION_IDS.map((id) => {
          const visible = sections[id];
          const meta = LANDING_SECTION_META[id];
          const toggling = togglingId === id;

          return (
            <div
              key={id}
              className="flex flex-wrap items-center justify-between gap-4 bg-neutral-50/80 px-4 py-4"
            >
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {meta.label}
                </p>
                <p className="mt-0.5 text-xs text-muted">{meta.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={visible}
                aria-label={`Show ${meta.label} on landing page`}
                disabled={toggling}
                onClick={() => void handleToggle(id)}
                className={cn(
                  "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60",
                  visible ? "bg-primary" : "bg-neutral-300",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-6 w-6 rounded-full bg-white shadow transition",
                    visible ? "translate-x-7" : "translate-x-1",
                  )}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
