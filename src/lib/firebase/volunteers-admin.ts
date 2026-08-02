import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import type { VolunteerInput } from "@/types/volunteer";
import type { VolunteerSource } from "@/types/whatsapp";

const VOLUNTEERS_COLLECTION = "volunteers";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export type AdminVolunteerRegisterResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "failed" };

export async function registerVolunteerAdmin(
  input: VolunteerInput,
  source: VolunteerSource,
): Promise<AdminVolunteerRegisterResult> {
  const fullName = input.fullName.trim().slice(0, 120);
  const email = input.email.trim().toLowerCase().slice(0, 200);
  const phone = input.phone.trim().slice(0, 40);
  const province = input.province.trim().slice(0, 80);
  const interest = input.interest.trim().slice(0, 120);
  const message = (input.message ?? "").trim().slice(0, 2000);

  if (
    !fullName ||
    !phone ||
    !province ||
    !interest ||
    !isValidEmail(email)
  ) {
    return { ok: false, reason: "invalid" };
  }

  try {
    await getAdminFirestore().collection(VOLUNTEERS_COLLECTION).add({
      fullName,
      email,
      phone,
      province,
      interest,
      message,
      source,
      registeredAt: FieldValue.serverTimestamp(),
    });

    return { ok: true };
  } catch (error) {
    console.error("Admin volunteer register failed", error);
    return { ok: false, reason: "failed" };
  }
}
