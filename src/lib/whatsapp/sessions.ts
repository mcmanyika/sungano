import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type {
  WhatsAppVolunteerDraft,
  WhatsAppVolunteerSession,
  WhatsAppVolunteerStep,
} from "@/types/whatsapp";

const SESSIONS_COLLECTION = "whatsappSessions";
const PROCESSED_COLLECTION = "whatsappProcessedMessages";

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
}

function mapSession(
  waId: string,
  data: Record<string, unknown>,
): WhatsAppVolunteerSession {
  const draft =
    data.draft && typeof data.draft === "object"
      ? (data.draft as WhatsAppVolunteerDraft)
      : {};

  return {
    waId,
    step: (typeof data.step === "string"
      ? data.step
      : "idle") as WhatsAppVolunteerStep,
    draft,
    updatedAt: toDate(data.updatedAt),
  };
}

export async function getWhatsAppSession(
  waId: string,
): Promise<WhatsAppVolunteerSession | null> {
  const snapshot = await getAdminFirestore()
    .collection(SESSIONS_COLLECTION)
    .doc(waId)
    .get();

  if (!snapshot.exists) {
    return null;
  }

  return mapSession(waId, snapshot.data() ?? {});
}

export async function saveWhatsAppSession(
  waId: string,
  step: WhatsAppVolunteerStep,
  draft: WhatsAppVolunteerDraft,
): Promise<void> {
  await getAdminFirestore()
    .collection(SESSIONS_COLLECTION)
    .doc(waId)
    .set(
      {
        step,
        draft,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

export async function clearWhatsAppSession(waId: string): Promise<void> {
  await getAdminFirestore().collection(SESSIONS_COLLECTION).doc(waId).delete();
}

/** Returns true if this message ID was already handled (webhook retry). */
export async function claimWhatsAppMessageId(
  messageId: string,
): Promise<boolean> {
  if (!messageId) {
    return false;
  }

  const ref = getAdminFirestore().collection(PROCESSED_COLLECTION).doc(messageId);

  try {
    await ref.create({
      createdAt: FieldValue.serverTimestamp(),
    });
    return false;
  } catch {
    return true;
  }
}
