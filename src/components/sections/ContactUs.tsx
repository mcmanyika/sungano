"use client";

import { ArrowUpRight, Loader2, MapPin, MessageCircle, Send } from "lucide-react";
import { motion } from "framer-motion";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { submitContactMessage } from "@/lib/firebase/contacts";
import { easeOut } from "@/lib/animations";
import { cn } from "@/lib/utils";
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
  "h-11 w-full rounded-xl border border-neutral-200/90 bg-white/90 px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
};

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
    <Section id="contact" className="scroll-mt-24" variant="default">

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-[2.5rem] md:leading-[1.15]">
            Contact us
          </h2>
          <div className="mx-auto mt-3 h-px w-12 bg-secondary" aria-hidden />
          <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
            Questions, partnerships, or support — send a message and our team
            will respond.
          </p>
        </motion.div>

        <div className="mt-10 grid items-stretch gap-6 lg:mt-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-8">
          <motion.aside
            variants={fadeUp}
            className="rounded-2xl bg-primary p-6 text-white sm:p-8"
          >
              <h3 className="font-display text-2xl font-bold tracking-tight">
                Reach our team
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                Prefer a quick chat? Message us on WhatsApp, or use the form for
                a detailed enquiry.
              </p>

              <a
                href="https://wa.me/14697992071"
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-8 flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 transition hover:bg-white/15"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-neutral-900">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-secondary-light">
                    WhatsApp
                  </span>
                  <span className="mt-0.5 block text-base font-semibold">
                    +1 469 799 2071
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-white/60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
              </a>

              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-secondary-light" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                    Community
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/90">
                    Zimbabwe and the diaspora
                  </p>
                </div>
              </div>
          </motion.aside>

          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7"
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
                  className={cn(fieldClassName, "mt-1.5")}
                  autoComplete="name"
                  placeholder="Your name"
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
                  className={cn(fieldClassName, "mt-1.5")}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </label>
              <label className="text-sm font-medium text-neutral-700">
                Phone{" "}
                <span className="font-normal text-muted">(optional)</span>
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
                  className={cn(fieldClassName, "mt-1.5")}
                  autoComplete="tel"
                  placeholder="+263..."
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
                  className={cn(fieldClassName, "mt-1.5")}
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

            <label className="mt-4 block text-sm font-medium text-neutral-700">
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
                className={cn(fieldClassName, "mt-1.5")}
                placeholder="How can we help?"
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-neutral-700">
              Message
              <textarea
                required
                minLength={10}
                maxLength={4000}
                rows={5}
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
                className="mt-1.5 w-full rounded-xl border border-neutral-200/90 bg-white/90 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                placeholder="Write your message..."
              />
            </label>

            {feedback ? (
              <p
                role={status === "error" ? "alert" : "status"}
                className={cn(
                  "mt-4 rounded-xl px-3 py-2 text-sm font-medium",
                  status === "success"
                    ? "bg-accent/10 text-accent"
                    : "bg-red-50 text-red-600",
                )}
              >
                {feedback}
              </p>
            ) : null}

            <div className="mt-5">
              <Button type="submit" size="lg" disabled={status === "loading"}>
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    Send message
                    <Send className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </Section>
  );
}
