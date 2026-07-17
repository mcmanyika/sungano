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

export function VolunteerRegisterForm({ className }: { className?: string }) {
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

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-4 text-left", className)}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Full name
          </label>
          <input
            required
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({ ...current, fullName: event.target.value }))
            }
            className={fieldClassName}
            placeholder="Authorised representative"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            className={fieldClassName}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Phone
          </label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
            }
            className={fieldClassName}
            placeholder="+263..."
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Province
          </label>
          <select
            required
            value={form.province}
            onChange={(event) =>
              setForm((current) => ({ ...current, province: event.target.value }))
            }
            className={fieldClassName}
          >
            <option value="">Select province</option>
            {VOLUNTEER_PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Area of interest
        </label>
        <select
          required
          value={form.interest}
          onChange={(event) =>
            setForm((current) => ({ ...current, interest: event.target.value }))
          }
          className={fieldClassName}
        >
          <option value="">Select interest</option>
          {VOLUNTEER_INTERESTS.map((interest) => (
            <option key={interest} value={interest}>
              {interest}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Message <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          rows={4}
          value={form.message}
          onChange={(event) =>
            setForm((current) => ({ ...current, message: event.target.value }))
          }
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          placeholder="Tell us how you would like to help..."
        />
      </div>

      {message && (
        <p
          role="status"
          className={cn(
            "text-sm font-medium",
            status === "success" ? "text-accent" : "text-red-600",
          )}
        >
          {message}
        </p>
      )}

      <Button type="submit" disabled={status === "loading"} size="lg">
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
