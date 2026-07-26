import { NavigationForm } from "@/components/admin/NavigationForm";

export default function AdminNavigationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          Navigation
        </h2>
        <p className="mt-1 text-sm text-muted">
          Manage header, About mega menu, footer, and social links used across the
          site.
        </p>
      </div>
      <NavigationForm />
    </div>
  );
}
