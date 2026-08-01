import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  deleteStoreProductImage,
  uploadStoreProductImage,
} from "@/lib/firebase/storage";
import {
  isStoreCurrency,
  type StoreCurrency,
  type StoreProduct,
  type StoreProductInput,
} from "@/types/store";

const PRODUCTS_COLLECTION = "products";

function publishedProductsQuery(db: ReturnType<typeof getClientFirestore>) {
  return query(
    collection(db, PRODUCTS_COLLECTION),
    where("published", "==", true),
  );
}

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
}

function mapProduct(id: string, data: DocumentData): StoreProduct {
  const currencyValue = String(data.currency ?? "USD").toUpperCase();

  return {
    id,
    name: String(data.name ?? ""),
    description: String(data.description ?? ""),
    price: Number(data.price ?? 0),
    currency: isStoreCurrency(currencyValue) ? currencyValue : "USD",
    imageUrl: String(data.imageUrl ?? ""),
    storagePath: String(data.storagePath ?? ""),
    published: Boolean(data.published),
    publishedAt: toDate(data.publishedAt),
    createdAt: toDate(data.createdAt) ?? new Date(),
    updatedAt: toDate(data.updatedAt) ?? new Date(),
  };
}

function getSortDate(product: StoreProduct): Date {
  return product.publishedAt ?? product.updatedAt ?? product.createdAt;
}

function toFirestorePayload(input: StoreProductInput) {
  const publishedAt = input.published
    ? (input.publishedAt ?? new Date())
    : null;

  return {
    name: input.name.trim(),
    description: input.description.trim(),
    price: Number(input.price),
    currency: input.currency,
    imageUrl: input.imageUrl.trim(),
    storagePath: input.storagePath.trim(),
    published: input.published,
    publishedAt,
  };
}

export async function getPublishedProducts(): Promise<StoreProduct[]> {
  if (!isFirebaseConfigured()) {
    return [];
  }

  try {
    const db = getClientFirestore();
    const snapshot = await getDocs(publishedProductsQuery(db));

    return snapshot.docs
      .map((document) => mapProduct(document.id, document.data()))
      .sort((a, b) => getSortDate(b).getTime() - getSortDate(a).getTime());
  } catch {
    return [];
  }
}

export function subscribeToPublishedProducts(
  onData: (products: StoreProduct[]) => void,
  onError?: (error: Error) => void,
): () => void {
  if (!isFirebaseConfigured()) {
    onData([]);
    return () => {};
  }

  const db = getClientFirestore();

  return onSnapshot(
    publishedProductsQuery(db),
    (snapshot) => {
      const products = snapshot.docs
        .map((document) => mapProduct(document.id, document.data()))
        .sort((a, b) => getSortDate(b).getTime() - getSortDate(a).getTime());

      onData(products);
    },
    (error) => onError?.(error),
  );
}

export async function getAllProducts(): Promise<StoreProduct[]> {
  const db = getClientFirestore();
  const snapshot = await getDocs(
    query(collection(db, PRODUCTS_COLLECTION), orderBy("updatedAt", "desc")),
  );

  return snapshot.docs.map((document) =>
    mapProduct(document.id, document.data()),
  );
}

export async function getProduct(id: string): Promise<StoreProduct | null> {
  const db = getClientFirestore();
  const snapshot = await getDoc(doc(db, PRODUCTS_COLLECTION, id));

  if (!snapshot.exists()) {
    return null;
  }

  return mapProduct(snapshot.id, snapshot.data());
}

export async function createProduct(
  input: Omit<StoreProductInput, "imageUrl" | "storagePath">,
  file: File,
): Promise<string> {
  const db = getClientFirestore();
  const productRef = doc(collection(db, PRODUCTS_COLLECTION));
  const { imageUrl, storagePath } = await uploadStoreProductImage(
    productRef.id,
    file,
  );

  try {
    await setDoc(productRef, {
      ...toFirestorePayload({
        ...input,
        imageUrl,
        storagePath,
      }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    await deleteStoreProductImage(storagePath);
    throw error;
  }

  return productRef.id;
}

export async function updateProduct(
  id: string,
  input: Omit<StoreProductInput, "imageUrl" | "storagePath"> &
    Partial<Pick<StoreProductInput, "imageUrl" | "storagePath">>,
  file?: File | null,
): Promise<void> {
  const db = getClientFirestore();
  const existing = await getProduct(id);

  if (!existing) {
    throw new Error("Product not found.");
  }

  let imageUrl = existing.imageUrl;
  let storagePath = existing.storagePath;
  let previousStoragePath: string | null = null;

  if (file) {
    const uploaded = await uploadStoreProductImage(id, file);
    previousStoragePath = existing.storagePath;
    imageUrl = uploaded.imageUrl;
    storagePath = uploaded.storagePath;
  }

  await updateDoc(doc(db, PRODUCTS_COLLECTION, id), {
    ...toFirestorePayload({
      ...input,
      imageUrl,
      storagePath,
    }),
    updatedAt: serverTimestamp(),
  });

  if (previousStoragePath && previousStoragePath !== storagePath) {
    await deleteStoreProductImage(previousStoragePath);
  }
}

export async function setProductPublished(
  id: string,
  published: boolean,
): Promise<void> {
  const db = getClientFirestore();
  const existing = await getProduct(id);

  if (!existing) {
    throw new Error("Product not found.");
  }

  await updateDoc(doc(db, PRODUCTS_COLLECTION, id), {
    published,
    publishedAt: published
      ? (existing.publishedAt ?? new Date())
      : null,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  const db = getClientFirestore();
  const existing = await getProduct(id);

  if (!existing) {
    return;
  }

  await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  await deleteStoreProductImage(existing.storagePath);
}

export type { StoreCurrency };
