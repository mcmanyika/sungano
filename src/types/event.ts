export interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  startAt: Date | null;
  endAt: Date | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventInput {
  title: string;
  description: string;
  location: string;
  startAt: Date | null;
  endAt: Date | null;
  published: boolean;
}

export function formatEventDate(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatEventTime(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatEventDateTime(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function toDateTimeLocalValue(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function fromDateTimeLocalValue(value: string): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
