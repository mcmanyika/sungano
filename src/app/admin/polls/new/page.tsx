import { PollForm } from "@/components/admin/PollForm";

export default function AdminNewPollPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          New poll
        </h2>
        <p className="mt-1 text-sm text-muted">
          Create a poll for the homepage community section.
        </p>
      </div>
      <PollForm />
    </div>
  );
}
