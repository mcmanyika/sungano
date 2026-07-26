"use client";

import { Loader2, MapPin, MessageCircle } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { submitContactMessage } from "@/lib/firebase/contacts";
import { cardSurface } from "@/lib/styles";
import {
  CONTACT_TOPICS,
  type ContactMessageInput,
} from "@/types/contact";

const emptyForm: ContactMessageInput = {
  fullName: "",
  email: "",
  phone: "",
  topic: "",
  subject: "",
  message: "",
};

const fieldClassName =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export function ContactUs() {
  const [form, setForm] = useState<ContactMessageInput>(emptyForm);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setFeedback("");

    const result = await submitContactMessage(form);

    if (result.ok) {
      setStatus("success");
      setFeedback("Thank you. Your message has been sent to our team.");
      setForm(emptyForm);
      void fetch("/api/email/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).catch(() => {
        // The message is already stored; notification email is best-effort.
      });
      return;
    }

    setStatus("error");
    setFeedback(
      result.reason === "invalid"
        ? "Please complete the required fields with a valid email."
        : result.reason === "not-configured"
          ? "The contact form is not available right now."
          : "Something went wrong. Please try again.",
    );
  }

  return (
    <Section
      id="contact"
      className="scroll-mt-24 bg-white"
      variant="default"
    >
      <SectionHeader title="Contact us" />

      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <div className={`h-fit p-5 sm:p-6 ${cardSurface}`}>
          <h3 className="font-display text-xl font-bold text-neutral-900">
            Reach our team
          </h3>
          <div className="mt-5 space-y-4">
            <a
              href="https://wa.me/14697992071"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 text-sm text-neutral-700 transition hover:text-primary"
            >
              <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>
                <strong className="block font-semibold text-neutral-900">
                  WhatsApp
                </strong>
                +1 469 799 2071
              </span>
            </a>
            <div className="flex items-start gap-3 text-sm text-neutral-700">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>
                <strong className="block font-semibold text-neutral-900">
                  Community
                </strong>
                Zimbabwe and the diaspora
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`space-y-4 p-5 sm:p-6 ${cardSurface}`}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-neutral-700">
              Full name
              <input
                required
                maxLength={120}
                value={form.fullName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    fullName: event.target.value,
                  }))
                }
                className={`${fieldClassName} mt-1.5`}
                autoComplete="name"
              />
            </label>
            <label className="text-sm font-medium text-neutral-700">
              Email
              <input
                required
                type="email"
                maxLength={200}
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                className={`${fieldClassName} mt-1.5`}
                autoComplete="email"
              />
            </label>
            <label className="text-sm font-medium text-neutral-700">
              Phone <span className="font-normal text-muted">(optional)</span>
              <input
                type="tel"
                maxLength={40}
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                className={`${fieldClassName} mt-1.5`}
                autoComplete="tel"
              />
            </label>
            <label className="text-sm font-medium text-neutral-700">
              Topic
              <select
                required
                value={form.topic}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    topic: event.target.value as ContactMessageInput["topic"],
                  }))
                }
                className={`${fieldClassName} mt-1.5`}
              >
                <option value="">Select a topic</option>
                {CONTACT_TOPICS.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-neutral-700">
            Subject
            <input
              required
              maxLength={160}
              value={form.subject}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  subject: event.target.value,
                }))
              }
              className={`${fieldClassName} mt-1.5`}
            />
          </label>

          <label className="block text-sm font-medium text-neutral-700">
            Message
            <textarea
              required
              minLength={10}
              maxLength={4000}
              rows={6}
              value={form.message}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          {feedback && (
            <p
              role={status === "error" ? "alert" : "status"}
              className={`text-sm font-medium ${
                status === "success" ? "text-accent" : "text-red-600"
              }`}
            >
              {feedback}
            </p>
          )}

          <Button type="submit" size="lg" disabled={status === "loading"}>
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending
              </>
            ) : (
              "Send message"
            )}
          </Button>
        </form>
      </div>
    </Section>
  );
}
