import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { newsArticles } from "@/lib/data";
import { getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { NewsArticle, NewsArticleInput } from "@/types/news";

const NEWS_COLLECTION = "news";

function publishedNewsQuery(db: ReturnType<typeof getClientFirestore>) {
  return query(collection(db, NEWS_COLLECTION), where("published", "==", true));
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

function mapNewsArticle(id: string, data: DocumentData): NewsArticle {
  const views = Number(data.views ?? 0);

  return {
    id,
    title: String(data.title ?? ""),
    author: String(data.author ?? ""),
    category: String(data.category ?? "General"),
    excerpt: String(data.excerpt ?? ""),
    body: String(data.body ?? ""),
    image: String(data.image ?? ""),
    views: Number.isFinite(views) && views > 0 ? Math.floor(views) : 0,
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
    author: "",
    category: article.category,
    excerpt: article.excerpt,
    body: article.excerpt,
    image: article.image,
    views: 0,
    published: true,
    publishedAt: new Date(article.date),
    createdAt: new Date(article.date),
    updatedAt: new Date(article.date),
  }));
}

export async function getPublishedNewsArticles(): Promise<NewsArticle[]> {
  if (!isFirebaseConfigured()) {
    return [];
  }

  try {
    const db = getClientFirestore();
    const snapshot = await getDocs(publishedNewsQuery(db));

    return snapshot.docs
      .map((document) => mapNewsArticle(document.id, document.data()))
      .sort((a, b) => getSortDate(b).getTime() - getSortDate(a).getTime());
  } catch {
    return [];
  }
}

function getSortDate(article: NewsArticle): Date {
  return article.publishedAt ?? article.updatedAt ?? article.createdAt;
}

export function subscribeToPublishedNewsArticles(
  onData: (articles: NewsArticle[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const db = getClientFirestore();

  return onSnapshot(
    publishedNewsQuery(db),
    (snapshot) => {
      const articles = snapshot.docs
        .map((document) => mapNewsArticle(document.id, document.data()))
        .sort((a, b) => getSortDate(b).getTime() - getSortDate(a).getTime());

      onData(articles);
    },
    (error) => onError?.(error),
  );
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

export async function getPublishedNewsArticle(
  id: string,
): Promise<NewsArticle | null> {
  const article = await getNewsArticle(id);

  if (!article?.published) {
    return null;
  }

  return article;
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
    author: input.author.trim(),
    category: input.category,
    excerpt: input.excerpt.trim(),
    body: input.body.trim(),
    image: input.image.trim(),
    views: 0,
    published: input.published,
    publishedAt,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return created.id;
}

export async function incrementNewsArticleViews(id: string): Promise<number | null> {
  if (!isFirebaseConfigured()) {
    return null;
  }

  try {
    const db = getClientFirestore();
    const articleRef = doc(db, NEWS_COLLECTION, id);

    await updateDoc(articleRef, {
      views: increment(1),
    });

    const snapshot = await getDoc(articleRef);

    if (!snapshot.exists()) {
      return null;
    }

    return mapNewsArticle(snapshot.id, snapshot.data()).views;
  } catch {
    return null;
  }
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
    author: input.author.trim(),
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
      author: "",
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
