import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getClientFirestore } from "@/lib/firebase/client";
import type { InboundEmail } from "@/types/inbound-email";

const COLLECTION = "inboundEmails";

function mapInboundEmail(
  id: string,
  data: Record<string, unknown>,
): InboundEmail {
  const receivedAt = data.receivedAt;
  const attachments = Array.isArray(data.attachments) ? data.attachments : [];

  return {
    id,
    from: String(data.from ?? ""),
    to: Array.isArray(data.to) ? data.to.map(String) : [],
    cc: Array.isArray(data.cc) ? data.cc.map(String) : [],
    subject: String(data.subject ?? "(no subject)"),
    text: String(data.text ?? ""),
    html: String(data.html ?? ""),
    messageId: String(data.messageId ?? ""),
    attachments: attachments.map((item) => {
      const attachment = (item ?? {}) as Record<string, unknown>;
      return {
        id: String(attachment.id ?? ""),
        filename: String(attachment.filename ?? "attachment"),
        contentType: String(attachment.contentType ?? "application/octet-stream"),
        size: typeof attachment.size === "number" ? attachment.size : 0,
      };
    }),
    read: Boolean(data.read),
    receivedAt: receivedAt instanceof Timestamp ? receivedAt.toDate() : null,
  };
}

export function subscribeToInboundEmails(
  onData: (emails: InboundEmail[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const db = getClientFirestore();
  const emailsQuery = query(
    collection(db, COLLECTION),
    orderBy("receivedAt", "desc"),
  );

  return onSnapshot(
    emailsQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((document) =>
          mapInboundEmail(document.id, document.data()),
        ),
      );
    },
    (error) => onError?.(error),
  );
}

export async function markInboundEmailRead(id: string): Promise<void> {
  const db = getClientFirestore();
  await updateDoc(doc(db, COLLECTION, id), { read: true });
}
