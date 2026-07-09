import { DeclarationForm } from "@/components/admin/DeclarationForm";

export default function AdminDeclarationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          Declaration
        </h2>
        <p className="mt-1 text-sm text-muted">
          Update the declaration shown on the homepage and in the Read the Declaration
          modal.
        </p>
      </div>
      <DeclarationForm />
    </div>
  );
}
