import { LandingSectionsForm } from "@/components/admin/LandingSectionsForm";

export default function AdminLandingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          Landing page
        </h2>
        <p className="mt-1 text-sm text-muted">
          Choose which sections appear on the public homepage.
        </p>
      </div>
      <LandingSectionsForm />
    </div>
  );
}
