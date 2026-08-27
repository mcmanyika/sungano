import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { savePendingViolationPhoto } from "@/lib/hall-of-shame/photos";
import {
  HALL_OF_SHAME_PROVINCES,
  MAX_VIOLATION_PHOTOS,
  isViolationActorType,
  isViolationType,
  type ViolationPhoto,
  type ViolationType,
} from "@/types/hall-of-shame";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid report payload." }, { status: 400 });
  }

  if (asString(formData.get("website"))) {
    return NextResponse.json({ ok: true });
  }

  const occurredOn = asString(formData.get("occurredOn")).slice(0, 10);
  const province = asString(formData.get("province")).slice(0, 80);
  const location = asString(formData.get("location")).slice(0, 160);
  const actorTypeRaw = asString(formData.get("actorType"));
  const actorName = asString(formData.get("actorName")).slice(0, 160);
  const summary = asString(formData.get("summary")).slice(0, 4000);
  const evidenceNotes = asString(formData.get("evidenceNotes")).slice(0, 2000);
  const anonymous = asString(formData.get("anonymous")) !== "false";
  const reporterName = anonymous
    ? ""
    : asString(formData.get("reporterName")).slice(0, 120);
  const reporterContact = anonymous
    ? ""
    : asString(formData.get("reporterContact")).slice(0, 200);

  const violationTypes = formData
    .getAll("violationTypes")
    .map((value) => asString(value))
    .filter(isViolationType)
    .slice(0, 8);

  const uniqueTypes: ViolationType[] = Array.from(new Set(violationTypes));
  const actorType = isViolationActorType(actorTypeRaw) ? actorTypeRaw : "";
  const provinceOk = (HALL_OF_SHAME_PROVINCES as readonly string[]).includes(
    province,
  );

  if (
    !provinceOk ||
    !actorType ||
    uniqueTypes.length === 0 ||
    summary.length < 20
  ) {
    return NextResponse.json(
      {
        error:
          "Please choose a province, who was involved, at least one violation type, and describe what happened.",
      },
      { status: 400 },
    );
  }

  if (occurredOn && !/^\d{4}-\d{2}-\d{2}$/.test(occurredOn)) {
    return NextResponse.json({ error: "Enter a valid date." }, { status: 400 });
  }

  if (!anonymous) {
    const looksLikeEmail = EMAIL_PATTERN.test(reporterContact);
    const looksLikePhone = reporterContact.replace(/\D/g, "").length >= 7;
    if (!reporterName || (!looksLikeEmail && !looksLikePhone)) {
      return NextResponse.json(
        {
          error:
            "Named reports need a name and a way to reach you (email or phone).",
        },
        { status: 400 },
      );
    }
  }

  const files = formData
    .getAll("photos")
    .filter((item): item is File => item instanceof File && item.size > 0)
    .slice(0, MAX_VIOLATION_PHOTOS);

  const db = getAdminFirestore();
  const ref = db.collection("violationReports").doc();
  let photos: ViolationPhoto[] = [];

  try {
    photos = await Promise.all(
      files.map((file, index) => savePendingViolationPhoto(ref.id, file, index)),
    );

    await ref.set({
      occurredOn,
      province,
      location,
      actorType,
      actorName,
      violationTypes: uniqueTypes,
      summary,
      evidenceNotes,
      anonymous,
      reporterName,
      reporterContact,
      photos,
      status: "pending",
      publicTitle: "",
      publicSummary: "",
      adminNotes: "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      publishedAt: null,
    });
  } catch (error) {
    console.error("Hall of Shame report failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save this report. Please try again.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id: ref.id });
}
