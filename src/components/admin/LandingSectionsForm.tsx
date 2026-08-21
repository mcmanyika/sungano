"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  getDonationCampaign,
  saveDonationCampaign,
} from "@/lib/firebase/donation-campaign";
import {
  clearHeroBannerImage,
  getLandingSections,
  saveHeroBannerImage,
  saveLandingSections,
} from "@/lib/firebase/landing-sections";
import { assertValidGalleryImageFile } from "@/lib/firebase/storage";
import { cardSurface } from "@/lib/styles";
import { cn } from "@/lib/utils";
import {
  HERO_VARIANT_META,
  HERO_VARIANTS,
  LANDING_SECTION_IDS,
  LANDING_SECTION_META,
  type HeroVariant,
  type LandingSectionId,
  type LandingSections,
} from "@/types/landing-sections";

export function LandingSectionsForm() {
  const [sections, setSections] = useState<LandingSections | null>(null);
  const [togglingId, setTogglingId] = useState<LandingSectionId | null>(null);
  const [savingVariant, setSavingVariant] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
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

  async function handleHeroVariant(heroVariant: HeroVariant) {
    if (!sections || sections.heroVariant === heroVariant) {
      return;
    }

    const next = { ...sections, heroVariant };
    setSavingVariant(true);
    setError("");
    setSuccess("");

    try {
      await saveLandingSections(next);
      setSections(next);
      setSuccess(
        heroVariant === "banner"
          ? "Hero is now the full-width banner."
          : "Hero is now the default volunteer layout.",
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
          : "Unable to update the hero banner.",
      );
    } finally {
      setSavingVariant(false);
    }
  }

  async function handleBannerFile(file: File | null) {
    if (!file) {
      return;
    }

    setUploadingBanner(true);
    setError("");
    setSuccess("");

    try {
      assertValidGalleryImageFile(file);
      setSections(await saveHeroBannerImage(file));
      setSuccess("Hero banner image updated.");
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
          : cause instanceof Error
            ? cause.message
            : "Unable to upload the hero banner.",
      );
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleClearBanner() {
    if (!sections?.heroBannerUrl) {
      return;
    }

    setUploadingBanner(true);
    setError("");
    setSuccess("");

    try {
      setSections(await clearHeroBannerImage());
      setSuccess("Hero banner reset to the default image.");
    } catch {
      setError("Unable to remove the uploaded hero banner.");
    } finally {
      setUploadingBanner(false);
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

      <div>
        <p className="text-sm font-semibold text-neutral-900">Hero style</p>
        <p className="mt-0.5 text-xs text-muted">
          Choose which banner visitors see when Hero is visible. Default stays
          on until you switch to Banner.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {HERO_VARIANTS.map((variant) => {
            const meta = HERO_VARIANT_META[variant];
            const selected = sections.heroVariant === variant;

            return (
              <button
                key={variant}
                type="button"
                disabled={savingVariant}
                onClick={() => void handleHeroVariant(variant)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-neutral-200 bg-neutral-50/80 hover:border-primary/30",
                )}
              >
                <p className="text-sm font-semibold text-neutral-900">
                  {meta.label}
                </p>
                <p className="mt-0.5 text-xs text-muted">{meta.description}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4">
          <p className="text-sm font-semibold text-neutral-900">
            Banner image
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Shown when Hero style is Banner. JPEG, PNG, WebP, or GIF up to 10MB.
          </p>
          <div className="relative mt-3 aspect-[16/7] w-full overflow-hidden rounded-xl bg-neutral-100">
            <Image
              src={sections.heroBannerUrl || "/images/banner1.png"}
              alt="Hero banner preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 640px"
              unoptimized={Boolean(sections.heroBannerUrl)}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="inline-flex">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={uploadingBanner}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  event.target.value = "";
                  void handleBannerFile(file);
                }}
                className="sr-only"
              />
              <span
                className={cn(
                  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white",
                  uploadingBanner && "pointer-events-none opacity-60",
                )}
              >
                {uploadingBanner ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {uploadingBanner ? "Uploading" : "Upload image"}
              </span>
            </label>
            {sections.heroBannerUrl ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingBanner}
                onClick={() => void handleClearBanner()}
              >
                Use default image
              </Button>
            ) : null}
          </div>
        </div>
      </div>

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
