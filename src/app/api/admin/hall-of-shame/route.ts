import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdminFromRequest } from "@/lib/email/admin-auth";
import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  deleteViolationPhotoPaths,
  isHallOfShameStoragePath,
  publishViolationPhotos,
} from "@/lib/hall-of-shame/photos";
import type { ViolationPhoto } from "@/types/hall-of-shame";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function mapPhotos(value: unknown): ViolationPhoto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const photo = (item ?? {}) as Record<string, unknown>;
      const storagePath = String(photo.storagePath ?? "").trim();
      if (!storagePath) {
        return null;
      }
      return {
        storagePath,
        contentType: String(photo.contentType ?? "image/jpeg"),
        imageUrl: String(photo.imageUrl ?? ""),
      };
    })
    .filter((photo): photo is ViolationPhoto => photo !== null);
}

export async function PATCH(request: Request) {
  const auth = await requireAdminFromRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const id = asString(body.id);
  const action = asString(body.action);
  const publicTitle = asString(body.publicTitle).slice(0, 160);
  const publicSummary = asString(body.publicSummary).slice(0, 4000);
  const adminNotes = asString(body.adminNotes).slice(0, 2000);
  const actorName = asString(body.actorName).slice(0, 160);
  const location = asString(body.location).slice(0, 160);

  if (!id) {
    return NextResponse.json({ error: "Missing report id." }, { status: 400 });
  }

  const db = getAdminFirestore();
  const reportRef = db.collection("violationReports").doc(id);
  const publicRef = db.collection("hallOfShame").doc(id);
  const snapshot = await reportRef.get();

  if (!snapshot.exists) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const data = snapshot.data() ?? {};
  const photos = mapPhotos(data.photos);

  try {
    if (action === "publish") {
      const title = publicTitle || asString(data.actorName) || "Recorded incident";
      const summary = publicSummary || asString(data.summary);

      if (summary.length < 20) {
        return NextResponse.json(
          { error: "Add a public summary before publishing." },
          { status: 400 },
        );
      }

      const publishedPhotos = await publishViolationPhotos(photos);

      await publicRef.set({
        title,
        summary,
        occurredOn: asString(data.occurredOn),
        province: asString(data.province),
        location: location || asString(data.location),
        actorType: asString(data.actorType) || "unknown",
        actorName: actorName || asString(data.actorName),
        violationTypes: Array.isArray(data.violationTypes)
          ? data.violationTypes
          : [],
        photos: publishedPhotos,
        publishedAt: FieldValue.serverTimestamp(),
      });

      await reportRef.update({
        status: "published",
        publicTitle: title,
        publicSummary: summary,
        adminNotes,
        actorName: actorName || asString(data.actorName),
        location: location || asString(data.location),
        publishedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ ok: true, status: "published" });
    }

    if (action === "unpublish" || action === "reject" || action === "hold") {
      const status =
        action === "unpublish" ? "held" : action === "reject" ? "rejected" : "held";

      await publicRef.delete().catch(() => undefined);
      await reportRef.update({
        status,
        publicTitle,
        publicSummary,
        adminNotes,
        publishedAt: null,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ ok: true, status });
    }

    if (action === "save") {
      await reportRef.update({
        publicTitle,
        publicSummary,
        adminNotes,
        actorName: actorName || asString(data.actorName),
        location: location || asString(data.location),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ ok: true, status: data.status });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    console.error("Hall of Shame admin update failed", error);
    return NextResponse.json(
      { error: "Unable to update this report." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdminFromRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const id = asString(body.id);
  if (!id) {
    return NextResponse.json({ error: "Missing report id." }, { status: 400 });
  }

  const db = getAdminFirestore();
  const reportRef = db.collection("violationReports").doc(id);
  const snapshot = await reportRef.get();

  if (!snapshot.exists) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const photos = mapPhotos(snapshot.data()?.photos);
  const paths = photos
    .map((photo) => photo.storagePath)
    .filter((path) => isHallOfShameStoragePath(path));

  await deleteViolationPhotoPaths(paths);
  await db.collection("hallOfShame").doc(id).delete().catch(() => undefined);
  await reportRef.delete();

  return NextResponse.json({ ok: true });
}
