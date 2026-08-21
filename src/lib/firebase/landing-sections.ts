import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  deleteHeroBannerImage,
  uploadHeroBannerImage,
} from "@/lib/firebase/storage";
import {
  DEFAULT_LANDING_SECTIONS,
  LANDING_SECTION_IDS,
  isHeroVariant,
  type LandingSectionId,
  type LandingSections,
} from "@/types/landing-sections";

const LANDING_SECTIONS_COLLECTION = "content";
const LANDING_SECTIONS_ID = "landingSections";

function landingSectionsRef() {
  return doc(
    getClientFirestore(),
    LANDING_SECTIONS_COLLECTION,
    LANDING_SECTIONS_ID,
  );
}

function mapLandingSections(data: Record<string, unknown>): LandingSections {
  const next = { ...DEFAULT_LANDING_SECTIONS };

  for (const id of LANDING_SECTION_IDS) {
    if (id in data) {
      next[id] = Boolean(data[id]);
    }
  }

  next.heroVariant = isHeroVariant(data.heroVariant)
    ? data.heroVariant
    : "default";
  next.heroBannerUrl =
    typeof data.heroBannerUrl === "string" ? data.heroBannerUrl.trim() : "";
  next.heroBannerPath =
    typeof data.heroBannerPath === "string" ? data.heroBannerPath.trim() : "";

  return next;
}

export function getDefaultLandingSections(): LandingSections {
  return { ...DEFAULT_LANDING_SECTIONS };
}

export async function getLandingSections(): Promise<LandingSections> {
  if (!isFirebaseConfigured()) {
    return getDefaultLandingSections();
  }

  try {
    const snapshot = await getDoc(landingSectionsRef());

    if (!snapshot.exists()) {
      return getDefaultLandingSections();
    }

    return mapLandingSections(snapshot.data());
  } catch {
    return getDefaultLandingSections();
  }
}

export function subscribeToLandingSections(
  onData: (sections: LandingSections) => void,
  onError?: (error: Error) => void,
): () => void {
  if (!isFirebaseConfigured()) {
    onData(getDefaultLandingSections());
    return () => {};
  }

  return onSnapshot(
    landingSectionsRef(),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(getDefaultLandingSections());
        return;
      }

      onData(mapLandingSections(snapshot.data()));
    },
    (error) => onError?.(error),
  );
}

export async function saveLandingSections(
  sections: LandingSections,
): Promise<void> {
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  for (const id of LANDING_SECTION_IDS) {
    payload[id] = Boolean(sections[id]);
  }

  payload.heroVariant =
    sections.heroVariant === "banner" ? "banner" : "default";
  payload.heroBannerUrl = sections.heroBannerUrl.trim().slice(0, 2000);
  payload.heroBannerPath = sections.heroBannerPath.trim().slice(0, 200);

  await setDoc(landingSectionsRef(), payload, {
    merge: true,
  });
}

export async function setLandingSectionVisible(
  id: LandingSectionId,
  visible: boolean,
): Promise<LandingSections> {
  const current = await getLandingSections();
  const next = { ...current, [id]: visible };
  await saveLandingSections(next);
  return next;
}

export async function saveHeroBannerImage(file: File): Promise<LandingSections> {
  const current = await getLandingSections();
  const uploaded = await uploadHeroBannerImage(file);
  const previousPath = current.heroBannerPath;

  try {
    const next: LandingSections = {
      ...current,
      heroBannerUrl: uploaded.imageUrl,
      heroBannerPath: uploaded.storagePath,
    };
    await saveLandingSections(next);

    if (previousPath && previousPath !== uploaded.storagePath) {
      await deleteHeroBannerImage(previousPath).catch(() => {
        // Previous file cleanup is best-effort.
      });
    }

    return next;
  } catch (error) {
    await deleteHeroBannerImage(uploaded.storagePath).catch(() => {});
    throw error;
  }
}

export async function clearHeroBannerImage(): Promise<LandingSections> {
  const current = await getLandingSections();
  const previousPath = current.heroBannerPath;
  const next: LandingSections = {
    ...current,
    heroBannerUrl: "",
    heroBannerPath: "",
  };
  await saveLandingSections(next);

  if (previousPath) {
    await deleteHeroBannerImage(previousPath).catch(() => {
      // Storage cleanup is best-effort after the document is updated.
    });
  }

  return next;
}
