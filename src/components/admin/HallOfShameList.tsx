"use client";

import {
  Check,
  Loader2,
  Pause,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getClientAuth } from "@/lib/firebase/client";
import { subscribeToAllViolationReports } from "@/lib/firebase/hall-of-shame";
import { cardSurface } from "@/lib/styles";
import { cn } from "@/lib/utils";
import {
  ACTOR_TYPE_LABELS,
  formatViolationDate,
  type ViolationReport,
  type ViolationStatus,
} from "@/types/hall-of-shame";

type Filter = "pending" | "published" | "held" | "rejected" | "all";

function AdminPhoto({ storagePath, imageUrl }: { storagePath: string; imageUrl: string }) {
  const [url, setUrl] = useState(imageUrl);

  useEffect(() => {
    if (imageUrl) {
      setUrl(imageUrl);
      return;
    }

    let cancelled = false;

    async function load() {
      const user = getClientAuth().currentUser;
      if (!user) {
        return;
      }
      const response = await fetch(
        `/api/admin/hall-of-shame/photo?path=${encodeURIComponent(storagePath)}`,
        { headers: { Authorization: `Bearer ${await user.getIdToken()}` } },
      );
      const data = (await response.json().catch(() => ({}))) as { url?: string };
      if (!cancelled && data.url) {
        setUrl(data.url);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [imageUrl, storagePath]);

  if (!url) {
    return (
      <div className="flex h-24 items-center justify-center rounded-xl bg-neutral-100 text-xs text-muted">
        Photo
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="h-24 w-full rounded-xl object-cover" />
  );
}

export function HallOfShameList() {
  const [reports, setReports] = useState<ViolationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("pending");
  const [selected, setSelected] = useState<ViolationReport | null>(null);
  const [publicTitle, setPublicTitle] = useState("");
  const [publicSummary, setPublicSummary] = useState("");
  const [actorName, setActorName] = useState("");
  const [location, setLocation] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return subscribeToAllViolationReports(
      (next) => {
        setReports(next);
        setLoading(false);
      },
      () => {
        setError("Unable to load reports.");
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    if (!selected) {
      return;
    }
    const latest = reports.find((report) => report.id === selected.id);
    if (latest) {
      setSelected(latest);
    }
  }, [reports, selected?.id]);

  const counts = useMemo(() => {
    return {
      pending: reports.filter((report) => report.status === "pending").length,
      published: reports.filter((report) => report.status === "published").length,
      held: reports.filter((report) => report.status === "held").length,
      rejected: reports.filter((report) => report.status === "rejected").length,
    };
  }, [reports]);

  const filtered = useMemo(() => {
    if (filter === "all") {
      return reports;
    }
    return reports.filter((report) => report.status === filter);
  }, [filter, reports]);

  function openReport(report: ViolationReport) {
    setSelected(report);
    setPublicTitle(report.publicTitle || report.actorName || "Recorded incident");
    setPublicSummary(report.publicSummary || report.summary);
    setActorName(report.actorName);
    setLocation(report.location);
    setAdminNotes(report.adminNotes);
    setError("");
  }

  async function runAction(action: string) {
    if (!selected) {
      return;
    }
    setBusy(true);
    setError("");

    try {
      const user = getClientAuth().currentUser;
      if (!user) {
        setError("You must be signed in as an admin.");
        return;
      }

      const response = await fetch("/api/admin/hall-of-shame", {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          id: selected.id,
          action,
          publicTitle,
          publicSummary,
          actorName,
          location,
          adminNotes,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Unable to update this report.");
        return;
      }

      if (action === "delete") {
        setSelected(null);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const filters: { id: Filter; label: string; count?: number }[] = [
    { id: "pending", label: "Pending", count: counts.pending },
    { id: "published", label: "Published", count: counts.published },
    { id: "held", label: "Held", count: counts.held },
    { id: "rejected", label: "Rejected", count: counts.rejected },
    { id: "all", label: "All" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          Hall of Shame
        </h2>
        <p className="mt-1 text-sm text-muted">
          Review confidential reports, redact details, then publish a public
          record. Reporter identity never goes public.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-semibold transition",
              filter === item.id
                ? "border-primary bg-primary text-white"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-primary/30",
            )}
          >
            {item.label}
            {typeof item.count === "number" ? ` (${item.count})` : ""}
          </button>
        ))}
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <ul className="space-y-3">
            {filtered.length === 0 ? (
              <li className={`rounded-2xl p-6 text-sm text-muted ${cardSurface}`}>
                No reports in this queue.
              </li>
            ) : (
              filtered.map((report) => (
                <li key={report.id}>
                  <button
                    type="button"
                    onClick={() => openReport(report)}
                    className={cn(
                      "w-full rounded-2xl p-4 text-left transition",
                      cardSurface,
                      selected?.id === report.id && "ring-2 ring-primary/30",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-neutral-900">
                        {report.actorName || ACTOR_TYPE_LABELS[report.actorType]}
                      </p>
                      <StatusBadge status={report.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {formatViolationDate(report.occurredOn || report.createdAt)} ·{" "}
                      {report.province}
                      {report.anonymous ? " · Anonymous" : ""}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
                      {report.summary}
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>

          {selected ? (
            <div className={`space-y-4 rounded-2xl p-5 ${cardSurface}`}>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldAlert className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-lg font-bold text-neutral-900">
                    Review before publishing
                  </p>
                  <p className="text-xs text-muted">
                    Edit the public title and summary. Strip victim identifiers.
                  </p>
                </div>
              </div>

              <dl className="grid gap-2 text-sm">
                <Row label="Submitted" value={selected.anonymous ? "Anonymous" : selected.reporterName} />
                {!selected.anonymous && selected.reporterContact ? (
                  <Row label="Contact" value={selected.reporterContact} />
                ) : null}
                <Row label="Actor type" value={ACTOR_TYPE_LABELS[selected.actorType]} />
                <Row label="Types" value={selected.violationTypes.join(", ") || "—"} />
                <Row label="Evidence notes" value={selected.evidenceNotes || "—"} />
              </dl>

              {selected.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {selected.photos.map((photo) => (
                    <AdminPhoto
                      key={photo.storagePath}
                      storagePath={photo.storagePath}
                      imageUrl={photo.imageUrl}
                    />
                  ))}
                </div>
              ) : null}

              <label className="block text-sm font-medium">
                Public title
                <input
                  value={publicTitle}
                  onChange={(event) => setPublicTitle(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <label className="block text-sm font-medium">
                Public summary
                <textarea
                  rows={7}
                  value={publicSummary}
                  onChange={(event) => setPublicSummary(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Alleged actor (public)
                  <input
                    value={actorName}
                    onChange={(event) => setActorName(event.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="block text-sm font-medium">
                  Area (public)
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-primary"
                  />
                </label>
              </div>
              <label className="block text-sm font-medium">
                Internal notes
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(event) => setAdminNotes(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <Button type="button" disabled={busy} onClick={() => void runAction("publish")}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Publish
                </Button>
                <Button type="button" variant="outline" disabled={busy} onClick={() => void runAction("hold")}>
                  <Pause className="h-4 w-4" />
                  Hold
                </Button>
                <Button type="button" variant="outline" disabled={busy} onClick={() => void runAction("reject")}>
                  <X className="h-4 w-4" />
                  Reject
                </Button>
                {selected.status === "published" ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void runAction("unpublish")}
                  >
                    Unpublish
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm("Delete this report and its photos?")) {
                      void runAction("delete");
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className={`flex items-center justify-center rounded-2xl p-8 text-sm text-muted ${cardSurface}`}>
              Select a report to review.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ViolationStatus }) {
  const styles: Record<ViolationStatus, string> = {
    pending: "bg-secondary/15 text-secondary-dark",
    published: "bg-accent/10 text-accent",
    held: "bg-neutral-100 text-neutral-600",
    rejected: "bg-red-50 text-red-600",
  };

  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", styles[status])}>
      {status}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className="text-neutral-800">{value}</dd>
    </div>
  );
}
