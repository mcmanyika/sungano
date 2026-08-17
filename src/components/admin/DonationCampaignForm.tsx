"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getClientAuth } from "@/lib/firebase/client";
import {
  getDonationCampaign,
  saveDonationCampaign,
} from "@/lib/firebase/donation-campaign";
import { setLandingSectionVisible } from "@/lib/firebase/landing-sections";
import { cardSurface } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { DONATION_CURRENCIES, formatDonationAmount } from "@/types/donation";
import {
  DEFAULT_DONATION_CAMPAIGN,
  type DonationCampaignCurrency,
  type DonationCampaignInput,
} from "@/types/donation-campaign";

export function DonationCampaignForm() {
  const [form, setForm] = useState<DonationCampaignInput>(
    DEFAULT_DONATION_CAMPAIGN,
  );
  const [raised, setRaised] = useState(0);
  const [donorCount, setDonorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadCampaign() {
      setLoading(true);
      setError("");

      try {
        const campaign = await getDonationCampaign();
        setForm({
          title: campaign.title,
          description: campaign.description,
          goal: campaign.goal,
          currency: campaign.currency,
          published: campaign.published,
        });
        setRaised(campaign.raised);
        setDonorCount(campaign.donorCount);
      } catch {
        setError("Unable to load the donation campaign.");
      } finally {
        setLoading(false);
      }
    }

    void loadCampaign();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await saveDonationCampaign(form);
      const campaign = await getDonationCampaign();
      setRaised(campaign.raised);
      setDonorCount(campaign.donorCount);
      setSuccess("Donation tracker saved.");
    } catch {
      setError("Unable to save. Check your admin permissions.");
    } finally {
      setSaving(false);
    }
  }

  async function handleVisibilityToggle() {
    const nextPublished = !form.published;
    setToggling(true);
    setError("");
    setSuccess("");

    try {
      const nextForm = { ...form, published: nextPublished };
      await saveDonationCampaign(nextForm);
      await setLandingSectionVisible("donationTracker", nextPublished);
      setForm(nextForm);
      setSuccess(
        nextPublished
          ? "Donation tracker is now visible on the landing page."
          : "Donation tracker is hidden from the landing page.",
      );
    } catch {
      setError("Unable to update landing page visibility.");
    } finally {
      setToggling(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    setError("");
    setSuccess("");

    try {
      const user = getClientAuth().currentUser;
      if (!user) {
        throw new Error("Not signed in.");
      }

      const token = await user.getIdToken();
      const response = await fetch("/api/donations/campaign/refresh", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Refresh failed.");
      }

      const campaign = await getDonationCampaign();
      setRaised(campaign.raised);
      setDonorCount(campaign.donorCount);
      setSuccess("Raised totals refreshed from donations.");
    } catch {
      setError("Unable to refresh raised totals.");
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-5 rounded-2xl p-6 ${cardSurface}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-neutral-900">
            Landing page tracker
          </h3>
          <p className="mt-1 text-sm text-muted">
            Progress bar goal shown on the public homepage.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void handleRefresh()}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh raised
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-neutral-50/80 px-4 py-4">
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            Show on landing page
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {form.published
              ? "The donation tracker section is visible to visitors."
              : "The donation tracker section is hidden from visitors."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.published}
          aria-label="Show donation tracker on landing page"
          disabled={toggling}
          onClick={() => void handleVisibilityToggle()}
          className={cn(
            "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60",
            form.published ? "bg-primary" : "bg-neutral-300",
          )}
        >
          <span
            className={cn(
              "inline-block h-6 w-6 rounded-full bg-white shadow transition",
              form.published ? "translate-x-7" : "translate-x-1",
            )}
          />
        </button>
      </div>

      <div className="rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
        Currently{" "}
        <span className="font-semibold">
          {formatDonationAmount(raised, form.currency)}
        </span>{" "}
        raised from {donorCount} gift{donorCount === 1 ? "" : "s"} in{" "}
        {form.currency}.
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Title
        </label>
        <input
          required
          value={form.title}
          onChange={(event) =>
            setForm((current) => ({ ...current, title: event.target.value }))
          }
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          rows={3}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Goal amount
          </label>
          <input
            required
            type="number"
            min="1"
            step="1"
            value={form.goal}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                goal: Number(event.target.value),
              }))
            }
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Currency
          </label>
          <select
            value={form.currency}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                currency: event.target.value as DonationCampaignCurrency,
              }))
            }
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            {DONATION_CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} — {currency.label}
              </option>
            ))}
          </select>
        </div>
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

      <Button type="submit" disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Save tracker
      </Button>
    </form>
  );
}
