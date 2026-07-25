"use client";

import { useState } from "react";
import { EmailBroadcastForm } from "@/components/admin/EmailBroadcastForm";
import { InboundEmailInbox } from "@/components/admin/InboundEmailInbox";
import { cn } from "@/lib/utils";

type EmailTab = "inbox" | "broadcast";

export function AdminEmailsView() {
  const [tab, setTab] = useState<EmailTab>("inbox");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          Emails
        </h2>
        <p className="mt-1 text-sm text-muted">
          Read inbound messages and send updates to subscribers.
        </p>
      </div>

      <div className="inline-flex rounded-xl bg-neutral-100 p-1">
        {(
          [
            { id: "inbox", label: "Inbox" },
            { id: "broadcast", label: "Broadcast" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition",
              tab === item.id
                ? "bg-white text-primary shadow-sm"
                : "text-neutral-500 hover:text-neutral-800",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "inbox" ? (
        <InboundEmailInbox />
      ) : (
        <EmailBroadcastForm embedded />
      )}
    </div>
  );
}
