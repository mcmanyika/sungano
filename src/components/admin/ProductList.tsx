"use client";

import { Loader2, Pencil, Plus, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  getAllProducts,
  setProductPublished,
} from "@/lib/firebase/products";
import { cardSurface } from "@/lib/styles";
import { cn } from "@/lib/utils";
import {
  formatStoreDate,
  formatStorePrice,
  type StoreProduct,
} from "@/types/store";

export function ProductList() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setProducts(await getAllProducts());
    } catch {
      setError("Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  async function handleToggleActive(product: StoreProduct) {
    const nextPublished = !product.published;
    setTogglingId(product.id);
    setError("");

    try {
      await setProductPublished(product.id, nextPublished);
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                published: nextPublished,
                publishedAt: nextPublished
                  ? (item.publishedAt ?? new Date())
                  : null,
              }
            : item,
        ),
      );
    } catch {
      setError(`Unable to ${nextPublished ? "activate" : "deactivate"} this product.`);
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900">
            Store
          </h2>
          <p className="mt-1 text-sm text-muted">
            Manage merchandise for Stripe Checkout.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => loadProducts()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button href="/admin/store/new">
            <Plus className="h-4 w-4" />
            New product
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className={`rounded-2xl p-8 text-center ${cardSurface}`}>
          <p className="text-neutral-700">
            No products yet. Add your first merchandise item.
          </p>
        </div>
      ) : (
        <div className={`overflow-hidden rounded-2xl ${cardSurface}`}>
          <div className="divide-y divide-neutral-200/80">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          product.published
                            ? "bg-accent/10 text-accent"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {product.published ? "Active" : "Deactivated"}
                      </span>
                      <span className="text-xs font-semibold text-neutral-700">
                        {formatStorePrice(product.price, product.currency)}
                      </span>
                      {product.publishedAt && (
                        <span className="text-xs text-muted">
                          {formatStoreDate(product.publishedAt)}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-display text-base font-bold text-neutral-900">
                      {product.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted">
                      {product.published ? "Active" : "Off"}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={product.published}
                      aria-label={
                        product.published
                          ? `Deactivate ${product.name}`
                          : `Activate ${product.name}`
                      }
                      disabled={togglingId === product.id}
                      onClick={() => void handleToggleActive(product)}
                      className={cn(
                        "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60",
                        product.published ? "bg-primary" : "bg-neutral-300",
                      )}
                    >
                      {togglingId === product.id ? (
                        <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin text-white" />
                      ) : (
                        <span
                          className={cn(
                            "inline-block h-6 w-6 rounded-full bg-white shadow transition",
                            product.published
                              ? "translate-x-7"
                              : "translate-x-1",
                          )}
                        />
                      )}
                    </button>
                  </div>
                  <Link
                    href={`/admin/store/${product.id}/edit`}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-primary/20 hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
