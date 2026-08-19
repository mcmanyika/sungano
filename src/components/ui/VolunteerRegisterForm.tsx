"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { registerVolunteer } from "@/lib/firebase/volunteers";
import { cn } from "@/lib/utils";
import {
  VOLUNTEER_INTERESTS,
  VOLUNTEER_PROVINCES,
  type VolunteerInput,
} from "@/types/volunteer";

const emptyForm: VolunteerInput = {
  fullName: "",
  email: "",
  phone: "",
  province: "",
  interest: "",
  message: "",
};

const fieldClassName =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

const compactFieldClassName =
  "h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

const heroFieldClassName =
  "h-10 w-full rounded-lg border border-white/25 bg-white/10 px-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] outline-none transition placeholder:text-white/45 focus:border-secondary-light focus:bg-white/15 focus:ring-2 focus:ring-secondary/25";

const heroTextareaClassName =
  "w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] outline-none transition placeholder:text-white/45 focus:border-secondary-light focus:bg-white/15 focus:ring-2 focus:ring-secondary/25";

export function VolunteerRegisterForm({
  className,
  compact = false,
  tone = "default",
}: {
  className?: string;
  compact?: boolean;
  tone?: "default" | "hero";
}) {
  const [form, setForm] = useState<VolunteerInput>(emptyForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const result = await registerVolunteer(form);

    if (result.ok) {
      setStatus("success");
      setMessage("Thank you. Your registration was received.");
      void fetch("/api/email/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).catch(() => {
        // Registration already succeeded; email is best-effort.
      });
      setForm(emptyForm);
      return;
    }

    setStatus("error");

    if (result.reason === "invalid") {
      setMessage("Please complete all required fields with a valid email.");
      return;
    }

    if (result.reason === "not-configured") {
      setMessage("Volunteer registration is not available right now.");
      return;
    }

    setMessage("Something went wrong. Please try again.");
  }

  const onHero = tone === "hero";
  const inputClass = onHero
    ? heroFieldClassName
    : compact
      ? compactFieldClassName
      : fieldClassName;
  const labelClass = onHero
    ? "mb-1 block text-xs font-medium text-white/80"
    : compact
      ? "mb-1 block text-xs font-medium text-neutral-700"
      : "mb-1.5 block text-sm font-medium text-neutral-700";
  const optionClass = onHero ? "bg-white text-neutral-900" : undefined;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(compact ? "space-y-3 text-left" : "space-y-4 text-left", className)}
    >
      <div className={cn("grid gap-4", compact ? "gap-3 sm:grid-cols-2" : "sm:grid-cols-2")}>
        <div>
          <label className={labelClass}>
            Full name
          </label>
          <input
            required
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({ ...current, fullName: event.target.value }))
            }
            className={inputClass}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className={labelClass}>
            Email
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className={labelClass}>
            Phone
          </label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
            }
            className={inputClass}
            placeholder="+263..."
          />
        </div>
        <div>
          <label className={labelClass}>
            Province
          </label>
          <select
            required
            value={form.province}
            onChange={(event) =>
              setForm((current) => ({ ...current, province: event.target.value }))
            }
            className={inputClass}
          >
            <option className={optionClass} value="">
              Select province
            </option>
            {VOLUNTEER_PROVINCES.map((province) => (
              <option key={province} className={optionClass} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Area of interest
        </label>
        <select
          required
          value={form.interest}
          onChange={(event) =>
            setForm((current) => ({ ...current, interest: event.target.value }))
          }
          className={inputClass}
        >
          <option className={optionClass} value="">
            Select interest
          </option>
          {VOLUNTEER_INTERESTS.map((interest) => (
            <option key={interest} className={optionClass} value={interest}>
              {interest}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>
          Message{" "}
          <span
            className={cn(
              "font-normal",
              onHero ? "text-white/50" : "text-muted",
            )}
          >
            (optional)
          </span>
        </label>
        <textarea
          rows={compact ? 2 : 4}
          value={form.message}
          onChange={(event) =>
            setForm((current) => ({ ...current, message: event.target.value }))
          }
          className={
            onHero
              ? heroTextareaClassName
              : compact
                ? "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                : "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          }
          placeholder="Tell us how you would like to help..."
        />
      </div>

      {message && (
        <p
          role="status"
          className={cn(
            "text-sm font-medium",
            status === "success"
              ? onHero
                ? "text-secondary-light"
                : "text-accent"
              : onHero
                ? "text-red-200"
                : "text-red-600",
          )}
        >
          {message}
        </p>
      )}

      <Button
        type="submit"
        variant={onHero ? "gold" : "primary"}
        disabled={status === "loading"}
        size={compact || onHero ? "md" : "lg"}
        className={compact || onHero ? "w-full" : undefined}
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting
          </>
        ) : (
          "Register as Volunteer"
        )}
      </Button>
    </form>
  );
}
