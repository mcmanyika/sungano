"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DonateModal } from "@/components/ui/DonateModal";
import { Section } from "@/components/ui/Section";
import { easeOut } from "@/lib/animations";
import { getDefaultDonationCampaign } from "@/lib/firebase/donation-campaign";
import { formatDonationAmount } from "@/types/donation";
import {
  donationProgressPercent,
  type DonationCampaign,
} from "@/types/donation-campaign";

export function DonationTracker() {
  const [campaign, setCampaign] = useState<DonationCampaign>(
    getDefaultDonationCampaign,
  );
  const [loading, setLoading] = useState(true);
  const [donateOpen, setDonateOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      try {
        const response = await fetch("/api/donations/progress", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load progress");
        }

        const data = (await response.json()) as {
          title?: string;
          description?: string;
          goal?: number;
          currency?: string;
          raised?: number;
          donorCount?: number;
          published?: boolean;
        };

        if (cancelled) {
          return;
        }

        const defaults = getDefaultDonationCampaign();
        setCampaign({
          title: String(data.title ?? defaults.title),
          description: String(data.description ?? defaults.description),
          goal: Number(data.goal ?? defaults.goal),
          currency: (["USD", "ZAR", "GBP", "EUR"].includes(
            String(data.currency ?? "").toUpperCase(),
          )
            ? String(data.currency).toUpperCase()
            : defaults.currency) as DonationCampaign["currency"],
          raised: Number(data.raised ?? 0),
          donorCount: Number(data.donorCount ?? 0),
          published: data.published !== false,
          updatedAt: null,
        });
      } catch {
        if (!cancelled) {
          setCampaign(getDefaultDonationCampaign());
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProgress();
    const interval = window.setInterval(() => {
      void loadProgress();
    }, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  if (loading || !campaign.published || campaign.goal <= 0) {
    return null;
  }

  const percent = donationProgressPercent(campaign.raised, campaign.goal);
  const raisedLabel = formatDonationAmount(campaign.raised, campaign.currency);
  const goalLabel = formatDonationAmount(campaign.goal, campaign.currency);

  return (
    <>
      <Section id="donate-tracker" className="scroll-mt-28" variant="muted">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: easeOut }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Donation tracker
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {campaign.title}
          </h2>
          <div className="mx-auto mt-3 h-px w-12 bg-secondary" aria-hidden />
          {campaign.description ? (
            <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
              {campaign.description}
            </p>
          ) : null}

          <div className="mt-8 text-left">
            <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
              <p className="font-display text-2xl font-bold text-neutral-900 sm:text-3xl">
                {raisedLabel}
                <span className="ml-2 text-base font-semibold text-muted">
                  raised
                </span>
              </p>
              <p className="text-sm font-medium text-muted">
                Goal {goalLabel}
              </p>
            </div>

            <div
              className="h-4 overflow-hidden rounded-full bg-neutral-200/90"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(percent)}
              aria-label={`Donation progress ${Math.round(percent)} percent`}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary via-primary-light to-accent"
                initial={{ width: 0 }}
                whileInView={{ width: `${percent}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: easeOut, delay: 0.15 }}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
              <p>
                <span className="font-semibold text-neutral-800">
                  {Math.round(percent)}%
                </span>{" "}
                of goal
              </p>
              {campaign.donorCount > 0 ? (
                <p>
                  {campaign.donorCount} gift
                  {campaign.donorCount === 1 ? "" : "s"}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-8">
            <Button type="button" size="lg" onClick={() => setDonateOpen(true)}>
              <Heart className="h-4 w-4" />
              Donate now
            </Button>
          </div>
        </motion.div>
      </Section>

      <DonateModal open={donateOpen} onClose={() => setDonateOpen(false)} />
    </>
  );
}
