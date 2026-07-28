"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { deleteProduct, getProduct } from "@/lib/firebase/products";
import type { StoreProduct } from "@/types/store";

export default function AdminEditProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError("");

      try {
        const nextProduct = await getProduct(params.id);

        if (!nextProduct) {
          setError("Product not found.");
          return;
        }

        setProduct(nextProduct);
      } catch {
        setError("Unable to load this product.");
      } finally {
        setLoading(false);
      }
    }

    void loadProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <p className="text-sm font-medium text-red-600" role="alert">
        {error || "Product not found."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          Edit product
        </h2>
        <p className="mt-1 text-sm text-muted">{product.name}</p>
      </div>
      <ProductForm
        product={product}
        onDelete={() => deleteProduct(product.id)}
      />
    </div>
  );
}
