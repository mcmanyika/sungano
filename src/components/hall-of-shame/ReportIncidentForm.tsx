"use client";

import { ImagePlus, Loader2, Send } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cardSurface } from "@/lib/styles";
import { cn } from "@/lib/utils";
import {
  ACTOR_TYPE_LABELS,
  HALL_OF_SHAME_PROVINCES,
  MAX_VIOLATION_PHOTOS,
  VIOLATION_ACTOR_TYPES,
  VIOLATION_TYPES,
  type ViolationActorType,
  type ViolationType,
} from "@/types/hall-of-shame";

const MAX_PHOTOS = MAX_VIOLATION_PHOTOS;
const fieldClassName =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/15";

function PhotoPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  if (!url) {
    return (
      <li className="h-24 rounded-xl bg-neutral-100" />
    );
  }

  return (
    <li className="relative overflow-hidden rounded-xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={file.name} className="h-24 w-full object-cover" />
      <button
        type="button"
        className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white"
        onClick={onRemove}
      >
        Remove
      </button>
    </li>
  );
}

interface ReportIncidentFormProps {
  compact?: boolean;
}

export function ReportIncidentForm({ compact = false }: ReportIncidentFormProps) {
  const [occurredOn, setOccurredOn] = useState("");
  const [province, setProvince] = useState("");
  const [location, setLocation] = useState("");
  const [actorType, setActorType] = useState<ViolationActorType | "">("");
  const [actorName, setActorName] = useState("");
  const [violationTypes, setViolationTypes] = useState<ViolationType[]>([]);
  const [summary, setSummary] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  function toggleType(type: ViolationType) {
    setViolationTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList) {
      return;
    }
    setPhotos((current) =>
      [...current, ...Array.from(fileList)].slice(0, MAX_PHOTOS),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData();
    formData.set("occurredOn", occurredOn);
    formData.set("province", province);
    formData.set("location", location);
    formData.set("actorType", actorType);
    formData.set("actorName", actorName);
    formData.set("summary", summary);
    formData.set("evidenceNotes", evidenceNotes);
    formData.set("anonymous", anonymous ? "true" : "false");
    formData.set("reporterName", reporterName);
    formData.set("reporterContact", reporterContact);
    formData.set("website", "");
    for (const type of violationTypes) {
      formData.append("violationTypes", type);
    }
    for (const file of photos) {
      formData.append("photos", file);
    }

    try {
      const response = await fetch("/api/hall-of-shame/report", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Unable to send this report.");
        return;
      }

      setStatus("success");
      setMessage(
        "Thank you. Your report is confidential until our team reviews it. Nothing is published without moderation.",
      );
      setOccurredOn("");
      setProvince("");
      setLocation("");
      setActorType("");
      setActorName("");
      setViolationTypes([]);
      setSummary("");
      setEvidenceNotes("");
      setAnonymous(true);
      setReporterName("");
      setReporterContact("");
      setPhotos([]);
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form
      id="report-incident"
      onSubmit={handleSubmit}
      className={cn("space-y-4 rounded-2xl p-5 sm:p-6", cardSurface, compact && "p-5")}
    >
      <div>
        <h3 className="font-display text-lg font-bold text-neutral-900">
          Report an incident
        </h3>
        <p className="mt-1 text-sm text-muted">
          You can stay anonymous. Do not include home addresses or the names of
          victims unless they have asked you to.
        </p>
      </div>

      <label htmlFor="anonymous-report" className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-3 text-sm">
        <input
          id="anonymous-report"
          type="checkbox"
          checked={anonymous}
          onChange={(event) => setAnonymous(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary/20"
        />
        <span>
          <span className="font-medium text-neutral-900">Submit anonymously</span>
          <span className="mt-0.5 block text-xs text-muted">
            We will not publish your name or contact details.
          </span>
        </span>
      </label>

      {!anonymous ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="reporter-name" className="mb-1.5 block text-sm font-medium">
              Your name
            </label>
            <input
              id="reporter-name"
              value={reporterName}
              onChange={(event) => setReporterName(event.target.value)}
              className={fieldClassName}
              required={!anonymous}
            />
          </div>
          <div>
            <label htmlFor="reporter-contact" className="mb-1.5 block text-sm font-medium">
              Email or phone
            </label>
            <input
              id="reporter-contact"
              value={reporterContact}
              onChange={(event) => setReporterContact(event.target.value)}
              className={fieldClassName}
              required={!anonymous}
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="occurred-on" className="mb-1.5 block text-sm font-medium">
            Date (if known)
          </label>
          <input
            id="occurred-on"
            type="date"
            value={occurredOn}
            onChange={(event) => setOccurredOn(event.target.value)}
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="province" className="mb-1.5 block text-sm font-medium">
            Province
          </label>
          <select
            id="province"
            required
            value={province}
            onChange={(event) => setProvince(event.target.value)}
            className={fieldClassName}
          >
            <option value="">Select province</option>
            {HALL_OF_SHAME_PROVINCES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="location" className="mb-1.5 block text-sm font-medium">
          Area or town
        </label>
        <input
          id="location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className={fieldClassName}
          placeholder="General area only"
        />
      </div>

      <div>
        <label htmlFor="actor-type" className="mb-1.5 block text-sm font-medium">
          Who was involved
        </label>
        <select
          id="actor-type"
          required
          value={actorType}
          onChange={(event) =>
            setActorType(event.target.value as ViolationActorType | "")
          }
          className={fieldClassName}
        >
          <option value="">Select</option>
          {VIOLATION_ACTOR_TYPES.map((item) => (
            <option key={item} value={item}>
              {ACTOR_TYPE_LABELS[item]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="actor-name" className="mb-1.5 block text-sm font-medium">
          Alleged actor, unit, or group (optional)
        </label>
        <input
          id="actor-name"
          value={actorName}
          onChange={(event) => setActorName(event.target.value)}
          className={fieldClassName}
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">What happened</legend>
        <div className="flex flex-wrap gap-2">
          {VIOLATION_TYPES.map((type) => {
            const selected = violationTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  selected
                    ? "border-primary bg-primary text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-primary/30",
                )}
              >
                {type}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="summary" className="mb-1.5 block text-sm font-medium">
          Describe the incident
        </label>
        <textarea
          id="summary"
          required
          minLength={20}
          rows={compact ? 5 : 7}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          placeholder="What happened, when, and how people were affected. Avoid exact home addresses."
        />
      </div>

      <div>
        <label htmlFor="evidence-notes" className="mb-1.5 block text-sm font-medium">
          Other evidence notes (optional)
        </label>
        <textarea
          id="evidence-notes"
          rows={3}
          value={evidenceNotes}
          onChange={(event) => setEvidenceNotes(event.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium">Photos (optional, up to {MAX_PHOTOS})</p>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50/80 px-4 py-6 text-center text-sm text-muted transition hover:border-primary/30 hover:text-primary">
          <ImagePlus className="mb-2 h-5 w-5" />
          JPEG, PNG, or WebP · 5MB each
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(event) => {
              handleFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
        {photos.length > 0 ? (
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {photos.map((file, index) => (
              <PhotoPreview
                key={`${file.name}-${file.size}-${index}`}
                file={file}
                onRemove={() =>
                  setPhotos((current) => current.filter((_, item) => item !== index))
                }
              />
            ))}
          </ul>
        ) : null}
      </div>

      {message ? (
        <p
          className={cn(
            "text-sm font-medium",
            status === "error" ? "text-red-600" : "text-accent",
          )}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}

      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Submit report
          </>
        )}
      </Button>
    </form>
  );
}
