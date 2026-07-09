"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { subscribeEmail } from "@/lib/firebase/subscribers";
import { cn } from "@/lib/utils";

interface EmailSubscribeProps {
  source?: string;
  className?: string;
  buttonLabel?: string;
  placeholder?: string;
}

export function EmailSubscribe({
  source = "harare-declaration",
  className,
  buttonLabel = "Subscribe",
  placeholder = "Enter your email",
}: EmailSubscribeProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const result = await subscribeEmail(email, source);

    if (result.ok) {
      setStatus("success");
      setMessage("You're subscribed. Thank you!");
      setEmail("");
      return;
    }

    setStatus("error");

    if (result.reason === "invalid") {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (result.reason === "not-configured") {
      setMessage("Subscriptions are not available right now.");
      return;
    }

    setMessage("Something went wrong. Please try again.");
  }

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center"
      >
        <label htmlFor={`subscribe-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`subscribe-${source}`}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== "idle") {
              setStatus("idle");
              setMessage("");
            }
          }}
          placeholder={placeholder}
          disabled={status === "loading" || status === "success"}
          className="h-12 w-full flex-1 rounded-full border border-white/25 bg-white/95 px-5 text-base text-neutral-900 placeholder:text-neutral-400 shadow-sm outline-none transition focus:border-white focus:ring-2 focus:ring-secondary/40 disabled:opacity-70"
        />
        <Button
          type="submit"
          variant="gold"
          size="lg"
          disabled={status === "loading" || status === "success"}
          className="shrink-0"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Subscribing
            </>
          ) : status === "success" ? (
            <>
              <Check className="h-4 w-4" />
              Subscribed
            </>
          ) : (
            <>
              {buttonLabel}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {message && (
        <p
          role="status"
          className={cn(
            "mt-3 text-sm font-medium",
            status === "success" ? "text-secondary-light" : "text-red-200",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}
