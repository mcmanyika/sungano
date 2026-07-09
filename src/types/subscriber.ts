export interface Subscriber {
  id: string;
  email: string;
  source: string;
  subscribedAt: Date | null;
}

export function formatSubscriberDate(date: Date | null): string {
  if (!date) {
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
