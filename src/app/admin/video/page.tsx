import { WelcomeVideoForm } from "@/components/admin/WelcomeVideoForm";

export default function AdminVideoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          Welcome Video
        </h2>
        <p className="mt-1 text-sm text-muted">
          Post and manage the welcome video shown on the homepage.
        </p>
      </div>
      <WelcomeVideoForm />
    </div>
  );
}
