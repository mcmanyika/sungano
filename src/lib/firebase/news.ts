import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { newsArticles } from "@/lib/data";
import { getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { NewsArticle, NewsArticleInput } from "@/types/news";

const NEWS_COLLECTION = "news";

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
}

function mapNewsArticle(id: string, data: DocumentData): NewsArticle {
  return {
    id,
    title: String(data.title ?? ""),
    category: String(data.category ?? "General"),
    excerpt: String(data.excerpt ?? ""),
    body: String(data.body ?? ""),
    image: String(data.image ?? ""),
    published: Boolean(data.published),
    publishedAt: toDate(data.publishedAt),
    createdAt: toDate(data.createdAt) ?? new Date(),
    updatedAt: toDate(data.updatedAt) ?? new Date(),
  };
}

function toStaticArticles(): NewsArticle[] {
  return newsArticles.map((article) => ({
    id: String(article.id),
    title: article.title,
    category: article.category,
    excerpt: article.excerpt,
    body: article.excerpt,
    image: article.image,
    published: true,
    publishedAt: new Date(article.date),
    createdAt: new Date(article.date),
    updatedAt: new Date(article.date),
  }));
}

export async function getPublishedNewsArticles(): Promise<NewsArticle[]> {
  if (!isFirebaseConfigured()) {
    return toStaticArticles();
  }

  try {
    const db = getClientFirestore();
    const snapshot = await getDocs(
      query(collection(db, NEWS_COLLECTION), orderBy("updatedAt", "desc")),
    );

    if (snapshot.empty) {
      return toStaticArticles();
    }

    return snapshot.docs
      .map((document) => mapNewsArticle(document.id, document.data()))
      .filter((article) => article.published);
  } catch {
    return toStaticArticles();
  }
}

export async function getAllNewsArticles(): Promise<NewsArticle[]> {
  const db = getClientFirestore();
  const snapshot = await getDocs(
    query(collection(db, NEWS_COLLECTION), orderBy("updatedAt", "desc")),
  );

  return snapshot.docs.map((document) =>
    mapNewsArticle(document.id, document.data()),
  );
}

export async function getNewsArticle(id: string): Promise<NewsArticle | null> {
  const db = getClientFirestore();
  const snapshot = await getDoc(doc(db, NEWS_COLLECTION, id));

  if (!snapshot.exists()) {
    return null;
  }

  return mapNewsArticle(snapshot.id, snapshot.data());
}

export async function createNewsArticle(
  input: NewsArticleInput,
): Promise<string> {
  const db = getClientFirestore();
  const publishedAt = input.published
    ? (input.publishedAt ?? new Date())
    : null;

  const created = await addDoc(collection(db, NEWS_COLLECTION), {
    title: input.title.trim(),
    category: input.category,
    excerpt: input.excerpt.trim(),
    body: input.body.trim(),
    image: input.image.trim(),
    published: input.published,
    publishedAt,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return created.id;
}

export async function updateNewsArticle(
  id: string,
  input: NewsArticleInput,
): Promise<void> {
  const db = getClientFirestore();
  const publishedAt = input.published
    ? (input.publishedAt ?? new Date())
    : null;

  await updateDoc(doc(db, NEWS_COLLECTION, id), {
    title: input.title.trim(),
    category: input.category,
    excerpt: input.excerpt.trim(),
    body: input.body.trim(),
    image: input.image.trim(),
    published: input.published,
    publishedAt,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNewsArticle(id: string): Promise<void> {
  const db = getClientFirestore();
  await deleteDoc(doc(db, NEWS_COLLECTION, id));
}

export async function seedNewsArticles(): Promise<number> {
  const existing = await getAllNewsArticles();

  if (existing.length > 0) {
    return 0;
  }

  let created = 0;

  for (const article of toStaticArticles()) {
    await createNewsArticle({
      title: article.title,
      category: article.category,
      excerpt: article.excerpt,
      body: article.body,
      image: article.image.replace(".jpg", ".svg"),
      published: true,
      publishedAt: article.publishedAt,
    });
    created += 1;
  }

  return created;
}
