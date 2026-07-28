import { ProductForm } from "@/components/admin/ProductForm";

export default function AdminNewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          New product
        </h2>
        <p className="mt-1 text-sm text-muted">
          Add merchandise for one-item Stripe Checkout.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
