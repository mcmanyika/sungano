"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { loginWithEmail } from "@/hooks/useAuth";
import { registerPartner } from "@/lib/firebase/partners";
import { siteConfig } from "@/lib/data";
import { cardSurface } from "@/lib/styles";
import { cn } from "@/lib/utils";

type Mode = "signin" | "register";

const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export function PartnerAuth() {
  const [mode, setMode] = useState<Mode>("signin");
  const [organisation, setOrganisation] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signin") {
        await loginWithEmail(email, password);
        // Auth state change re-renders the portal into the dashboard.
      } else {
        const result = await registerPartner({
          organisation,
          name,
          email,
          password,
        });

        if (!result.ok) {
          setError(result.error);
          setLoading(false);
          return;
        }
        // Successful registration signs the user in automatically.
      }
    } catch {
      setError(
        mode === "signin"
          ? "Invalid email or password."
          : "Could not create your account. Try again.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-5 py-24">
      <div className={`w-full max-w-md p-8 ${cardSurface} rounded-2xl`}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Partner Portal
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-neutral-900">
          {mode === "signin" ? "Sign in" : "Create a partner account"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {mode === "signin"
            ? `Track the donations you've made to ${siteConfig.shortName}.`
            : "Register to make and track donations over time."}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-neutral-100 p-1">
          {(["signin", "register"] as Mode[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setMode(option);
                setError("");
              }}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition",
                mode === option
                  ? "bg-white text-primary shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800",
              )}
            >
              {option === "signin" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label
                  htmlFor="partner-org"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Organisation
                </label>
                <input
                  id="partner-org"
                  type="text"
                  required
                  value={organisation}
                  onChange={(event) => setOrganisation(event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="partner-name"
                  className="mb-1.5 block text-sm font-medium text-neutral-700"
                >
                  Authorised representative
                </label>
                <input
                  id="partner-name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClass}
                />
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="partner-email"
              className="mb-1.5 block text-sm font-medium text-neutral-700"
            >
              Email
            </label>
            <input
              id="partner-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="partner-password"
              className="mb-1.5 block text-sm font-medium text-neutral-700"
            >
              Password
            </label>
            <input
              id="partner-password"
              type="password"
              required
              minLength={mode === "register" ? 8 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />
            {mode === "register" && (
              <p className="mt-1 text-xs text-muted">
                At least 8 characters.
              </p>
            )}
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
                {mode === "signin" ? "Signing in" : "Creating account"}
              </>
            ) : mode === "signin" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
