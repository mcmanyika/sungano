"use client";

import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createProduct, updateProduct } from "@/lib/firebase/products";
import { assertValidGalleryImageFile } from "@/lib/firebase/storage";
import { cardSurface } from "@/lib/styles";
import {
  STORE_CURRENCIES,
  type StoreCurrency,
  type StoreProduct,
} from "@/types/store";

interface ProductFormProps {
  product?: StoreProduct;
  onDelete?: () => Promise<void>;
}

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  currency: StoreCurrency;
  published: boolean;
  publishedAt: Date | null;
}

function toFormState(product?: StoreProduct): ProductFormState {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    currency: product?.currency ?? "USD",
    published: product?.published ?? false,
    publishedAt: product?.publishedAt ?? null,
  };
}

export function ProductForm({ product, onDelete }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormState>(() => toFormState(product));
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isEditing = Boolean(product);

  const previewUrl = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }

    return product?.imageUrl ?? "";
  }, [file, product?.imageUrl]);

  useEffect(() => {
    if (!file || !previewUrl.startsWith("blob:")) {
      return;
    }

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [file, previewUrl]);

  function updateField<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleFileChange(nextFile: File | null) {
    setError("");

    if (!nextFile) {
      setFile(null);
      return;
    }

    try {
      assertValidGalleryImageFile(nextFile);
      setFile(nextFile);
    } catch (caught) {
      setFile(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to use that image file.",
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!isEditing && !file) {
      setError("Choose a product image to upload.");
      setLoading(false);
      return;
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price greater than zero.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price,
        currency: form.currency,
        published: form.published,
        publishedAt: form.publishedAt,
      };

      if (isEditing && product) {
        await updateProduct(product.id, payload, file);
      } else if (file) {
        await createProduct(payload, file);
      }

      router.push("/admin/store");
      router.refresh();
    } catch (caught) {
      const message =
        caught instanceof Error && caught.message
          ? caught.message
          : "Unable to save this product. Check your admin permissions.";
      const code =
        caught && typeof caught === "object" && "code" in caught
          ? String((caught as { code?: string }).code)
          : "";

      setError(
        code
          ? `${message} (${code})`
          : message ||
              "Unable to save this product. Check your admin permissions.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!onDelete || !window.confirm("Delete this product permanently?")) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await onDelete();
      router.push("/admin/store");
      router.refresh();
    } catch {
      setError("Unable to delete this product.");
      setDeleting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-6 rounded-2xl p-6 ${cardSurface}`}
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Product image {isEditing ? "(optional replace)" : ""}
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          required={!isEditing}
          onChange={(event) =>
            handleFileChange(event.target.files?.[0] ?? null)
          }
          className="block w-full text-sm text-neutral-700 file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/15"
        />
        <p className="mt-2 text-xs text-muted">
          JPEG, PNG, WebP, or GIF up to 10MB.
        </p>
      </div>

      {previewUrl ? (
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700">Preview</p>
          <div className="relative aspect-4/3 w-full max-w-xl overflow-hidden rounded-xl bg-neutral-100">
            <Image
              src={previewUrl}
              alt={form.name || "Preview"}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 576px"
              unoptimized
            />
          </div>
        </div>
      ) : null}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Name
        </label>
        <input
          required
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          placeholder="T-shirt, tote bag, etc."
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          rows={3}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          placeholder="Short product description"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Price
          </label>
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={form.price}
            onChange={(event) => updateField("price", event.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            placeholder="25.00"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Currency
          </label>
          <select
            value={form.currency}
            onChange={(event) =>
              updateField("currency", event.target.value as StoreCurrency)
            }
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            {STORE_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(event) => {
            const published = event.target.checked;
            updateField("published", published);
            if (published && !form.publishedAt) {
              updateField("publishedAt", new Date());
            }
          }}
          className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary/20"
        />
        Published (visible in store)
      </label>

      {error && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEditing ? "Save changes" : "Add product"}
        </Button>
        <Button href="/admin/store" variant="outline" type="button">
          Cancel
        </Button>
        {onDelete && (
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleDelete()}
            disabled={deleting}
            className="ml-auto border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
