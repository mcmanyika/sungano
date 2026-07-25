import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  CONTACT_TOPICS,
  type ContactMessage,
  type ContactMessageInput,
  type ContactStatus,
  type ContactTopic,
} from "@/types/contact";

const COLLECTION = "contactMessages";

export type ContactSubmitResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "not-configured" | "failed" };

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isContactTopic(value: string): value is ContactTopic {
  return CONTACT_TOPICS.some((topic) => topic === value);
}

function mapContactMessage(
  id: string,
  data: Record<string, unknown>,
): ContactMessage {
  const topic = String(data.topic ?? "");
  const status = data.status === "resolved" ? "resolved" : "new";

  return {
    id,
    fullName: String(data.fullName ?? ""),
    email: String(data.email ?? ""),
    phone: String(data.phone ?? ""),
    topic: isContactTopic(topic) ? topic : "General enquiry",
    subject: String(data.subject ?? ""),
    message: String(data.message ?? ""),
    status,
    createdAt:
      data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
  };
}

export async function submitContactMessage(
  input: ContactMessageInput,
): Promise<ContactSubmitResult> {
  const fullName = input.fullName.trim().slice(0, 120);
  const email = input.email.trim().toLowerCase().slice(0, 200);
  const phone = input.phone.trim().slice(0, 40);
  const topic = input.topic;
  const subject = input.subject.trim().slice(0, 160);
  const message = input.message.trim().slice(0, 4000);

  if (
    !fullName ||
    !isValidEmail(email) ||
    !isContactTopic(topic) ||
    !subject ||
    message.length < 10
  ) {
    return { ok: false, reason: "invalid" };
  }

  if (!isFirebaseConfigured()) {
    return { ok: false, reason: "not-configured" };
  }

  try {
    await addDoc(collection(getClientFirestore(), COLLECTION), {
      fullName,
      email,
      phone,
      topic,
      subject,
      message,
      status: "new",
      createdAt: serverTimestamp(),
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

export function subscribeToContactMessages(
  onData: (messages: ContactMessage[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const messagesQuery = query(
    collection(getClientFirestore(), COLLECTION),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((document) =>
          mapContactMessage(document.id, document.data()),
        ),
      );
    },
    (error) => onError?.(error),
  );
}

export async function setContactStatus(
  id: string,
  status: ContactStatus,
): Promise<void> {
  await updateDoc(doc(getClientFirestore(), COLLECTION, id), { status });
}

export async function deleteContactMessage(id: string): Promise<void> {
  await deleteDoc(doc(getClientFirestore(), COLLECTION, id));
}
