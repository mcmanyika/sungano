import { EventForm } from "@/components/admin/EventForm";

export default function AdminNewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          New event
        </h2>
        <p className="mt-1 text-sm text-muted">
          Create an event for the homepage events section.
        </p>
      </div>
      <EventForm />
    </div>
  );
}
