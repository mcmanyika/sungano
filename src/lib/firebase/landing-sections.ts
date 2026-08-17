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
  DEFAULT_LANDING_SECTIONS,
  LANDING_SECTION_IDS,
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
