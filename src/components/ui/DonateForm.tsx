"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { startDonation } from "@/lib/donations/checkout";
import { cn } from "@/lib/utils";
import {
  DONATION_CURRENCIES,
  DONATION_INTERVALS,
  getDonationCurrency,
  MIN_DONATION_AMOUNT,
  type DonationInterval,
} from "@/types/donation";

interface DonateFormProps {
  defaultName?: string;
  defaultEmail?: string;
  partnerId?: string | null;
  lockEmail?: boolean;
}

export function DonateForm({
  defaultName = "",
  defaultEmail = "",
  partnerId = null,
  lockEmail = false,
}: DonateFormProps) {
  const [interval, setInterval] = useState<DonationInterval>("one_time");
  const [currencyCode, setCurrencyCode] = useState(DONATION_CURRENCIES[0].code);
  const [amount, setAmount] = useState<string>("50");
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currency = useMemo(
    () => getDonationCurrency(currencyCode),
    [currencyCode],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < MIN_DONATION_AMOUNT) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);

    const result = await startDonation({
      amount: numericAmount,
      currency: currencyCode,
      interval,
      donorName: name,
      email,
      message,
      partnerId,
    });

    if (result.ok) {
      window.location.href = result.url;
      return;
    }

    setError(result.error);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Interval */}
      <div>
        <span className="mb-1.5 block text-sm font-medium text-neutral-700">
          Frequency
        </span>
        <div className="grid grid-cols-3 gap-2">
          {DONATION_INTERVALS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setInterval(option.value)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                interval === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-neutral-200 text-neutral-600 hover:border-primary/30",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Currency */}
      <div>
        <label
          htmlFor="donate-currency"
          className="mb-1.5 block text-sm font-medium text-neutral-700"
        >
          Currency
        </label>
        <select
          id="donate-currency"
          value={currencyCode}
          onChange={(event) => setCurrencyCode(event.target.value)}
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          {DONATION_CURRENCIES.map((option) => (
            <option key={option.code} value={option.code}>
              {option.code} — {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Amount presets */}
      <div>
        <span className="mb-1.5 block text-sm font-medium text-neutral-700">
          Amount
        </span>
        <div className="grid grid-cols-4 gap-2">
          {currency.presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(String(preset))}
              className={cn(
                "rounded-xl border px-2 py-2.5 text-sm font-semibold transition",
                amount === String(preset)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-neutral-200 text-neutral-600 hover:border-primary/30",
              )}
            >
              {currency.symbol}
              {preset}
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center rounded-xl border border-neutral-200 bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
          <span className="text-sm font-semibold text-neutral-500">
            {currency.symbol}
          </span>
          <input
            type="number"
            inputMode="decimal"
            min={MIN_DONATION_AMOUNT}
            step="1"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="h-11 w-full bg-transparent px-2 text-sm outline-none"
            aria-label="Custom amount"
          />
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            {currencyCode}
          </span>
        </div>
      </div>

      {/* Name */}
      <div>
        <label
          htmlFor="donate-name"
          className="mb-1.5 block text-sm font-medium text-neutral-700"
        >
          Name <span className="text-neutral-400">(optional)</span>
        </label>
        <input
          id="donate-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name or organisation"
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="donate-email"
          className="mb-1.5 block text-sm font-medium text-neutral-700"
        >
          Email{" "}
          <span className="text-neutral-400">
            (optional — link donations to your partner account)
          </span>
        </label>
        <input
          id="donate-email"
          type="email"
          value={email}
          readOnly={lockEmail}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className={cn(
            "h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15",
            lockEmail && "bg-neutral-50 text-neutral-500",
          )}
        />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="donate-message"
          className="mb-1.5 block text-sm font-medium text-neutral-700"
        >
          Message <span className="text-neutral-400">(optional)</span>
        </label>
        <textarea
          id="donate-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          maxLength={500}
          placeholder="A note to the Coalition"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting to secure checkout
          </>
        ) : (
          "Continue to secure checkout"
        )}
      </Button>

      <p className="text-center text-xs text-muted">
        Payments are processed securely by Stripe. You can cancel a recurring
        donation at any time.
      </p>
    </form>
  );
}
