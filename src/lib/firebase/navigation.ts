import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { getClientFirestore } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  DEFAULT_SITE_NAVIGATION,
  SOCIAL_PLATFORMS,
  type AboutMenuConfig,
  type FooterLinksConfig,
  type HeaderLink,
  type SiteLink,
  type SiteNavigation,
  type SiteNavigationInput,
  type SocialLink,
  type SocialPlatform,
} from "@/types/navigation";

const NAVIGATION_DOC = "content/navigation";

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function mapSiteLink(
  value: unknown,
  fallback: SiteLink,
): SiteLink {
  const data = asRecord(value);

  if (!data) {
    return { ...fallback };
  }

  return {
    id: String(data.id ?? fallback.id),
    label: String(data.label ?? fallback.label),
    href: String(data.href ?? fallback.href),
  };
}

function mapHeaderLink(
  value: unknown,
  fallback: HeaderLink,
): HeaderLink {
  const data = asRecord(value);
  const base = mapSiteLink(value, fallback);

  if (!data) {
    return { ...fallback };
  }

  return {
    ...base,
    megaMenu:
      typeof data.megaMenu === "boolean"
        ? data.megaMenu
        : Boolean(fallback.megaMenu),
  };
}

function mapSiteLinkList(
  value: unknown,
  fallback: SiteLink[],
): SiteLink[] {
  if (!Array.isArray(value) || value.length === 0) {
    return fallback.map((link) => ({ ...link }));
  }

  return value.map((item, index) =>
    mapSiteLink(
      item,
      fallback[index] ?? {
        id: `link-${index}`,
        label: "Link",
        href: "",
      },
    ),
  );
}

function mapHeaderLinks(value: unknown): HeaderLink[] {
  const fallback = DEFAULT_SITE_NAVIGATION.header;

  if (!Array.isArray(value) || value.length === 0) {
    return fallback.map((link) => ({ ...link }));
  }

  return value.map((item, index) =>
    mapHeaderLink(
      item,
      fallback[index] ?? {
        id: `header-${index}`,
        label: "Link",
        href: "",
        megaMenu: false,
      },
    ),
  );
}

function isSocialPlatform(value: string): value is SocialPlatform {
  return (SOCIAL_PLATFORMS as readonly string[]).includes(value);
}

function mapSocialLinks(value: unknown): SocialLink[] {
  const fallback = DEFAULT_SITE_NAVIGATION.social;

  if (!Array.isArray(value) || value.length === 0) {
    return fallback.map((link) => ({ ...link }));
  }

  return value.map((item, index) => {
    const data = asRecord(item);
    const defaultLink = fallback[index] ?? {
      id: `social-${index}`,
      platform: "facebook" as SocialPlatform,
      label: "Social",
      href: "",
    };

    if (!data) {
      return { ...defaultLink };
    }

    const platformValue = String(data.platform ?? defaultLink.platform);

    return {
      id: String(data.id ?? defaultLink.id),
      platform: isSocialPlatform(platformValue)
        ? platformValue
        : defaultLink.platform,
      label: String(data.label ?? defaultLink.label),
      href: String(data.href ?? defaultLink.href),
    };
  });
}

function mapAboutMenu(value: unknown): AboutMenuConfig {
  const fallback = DEFAULT_SITE_NAVIGATION.aboutMenu;
  const data = asRecord(value);

  if (!data) {
    return {
      intro: { ...fallback.intro },
      sectionTitle: fallback.sectionTitle,
      sectionDescription: fallback.sectionDescription,
      items: fallback.items.map((item) => ({ ...item })),
    };
  }

  return {
    intro: mapSiteLink(data.intro, fallback.intro),
    sectionTitle: String(data.sectionTitle ?? fallback.sectionTitle),
    sectionDescription: String(
      data.sectionDescription ?? fallback.sectionDescription,
    ),
    items: mapSiteLinkList(data.items, fallback.items),
  };
}

function mapFooter(value: unknown): FooterLinksConfig {
  const fallback = DEFAULT_SITE_NAVIGATION.footer;
  const data = asRecord(value);

  if (!data) {
    return {
      about: fallback.about.map((link) => ({ ...link })),
      links: fallback.links.map((link) => ({ ...link })),
      legal: fallback.legal.map((link) => ({ ...link })),
    };
  }

  return {
    about: mapSiteLinkList(data.about, fallback.about),
    links: mapSiteLinkList(data.links, fallback.links),
    legal: mapSiteLinkList(data.legal, fallback.legal),
  };
}

function mapNavigation(data: Record<string, unknown>): SiteNavigation {
  return {
    header: mapHeaderLinks(data.header),
    donate: mapSiteLink(data.donate, DEFAULT_SITE_NAVIGATION.donate),
    aboutMenu: mapAboutMenu(data.aboutMenu),
    footer: mapFooter(data.footer),
    social: mapSocialLinks(data.social),
    updatedAt: toDate(data.updatedAt),
  };
}

function sanitizeSiteLink(link: SiteLink): SiteLink {
  return {
    id: link.id.trim() || createFallbackId("link"),
    label: link.label.trim(),
    href: link.href.trim(),
  };
}

function createFallbackId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

function sanitizeHeaderLink(link: HeaderLink): HeaderLink {
  const base = sanitizeSiteLink(link);

  return {
    ...base,
    megaMenu: Boolean(link.megaMenu),
  };
}

function sanitizeNavigationInput(
  input: SiteNavigationInput,
): SiteNavigationInput {
  return {
    header: input.header.map(sanitizeHeaderLink),
    donate: sanitizeSiteLink(input.donate),
    aboutMenu: {
      intro: sanitizeSiteLink(input.aboutMenu.intro),
      sectionTitle: input.aboutMenu.sectionTitle.trim(),
      sectionDescription: input.aboutMenu.sectionDescription.trim(),
      items: input.aboutMenu.items.map(sanitizeSiteLink),
    },
    footer: {
      about: input.footer.about.map(sanitizeSiteLink),
      links: input.footer.links.map(sanitizeSiteLink),
      legal: input.footer.legal.map(sanitizeSiteLink),
    },
    social: input.social.map((link) => ({
      id: link.id.trim() || createFallbackId("social"),
      platform: link.platform,
      label: link.label.trim(),
      href: link.href.trim(),
    })),
  };
}

export function getDefaultSiteNavigation(): SiteNavigation {
  return {
    ...sanitizeNavigationInput(DEFAULT_SITE_NAVIGATION),
    updatedAt: null,
  };
}

export async function getSiteNavigation(): Promise<SiteNavigation> {
  if (!isFirebaseConfigured()) {
    return getDefaultSiteNavigation();
  }

  try {
    const db = getClientFirestore();
    const snapshot = await getDoc(doc(db, NAVIGATION_DOC));

    if (!snapshot.exists()) {
      return getDefaultSiteNavigation();
    }

    return mapNavigation(snapshot.data());
  } catch {
    return getDefaultSiteNavigation();
  }
}

export function subscribeToSiteNavigation(
  onData: (navigation: SiteNavigation) => void,
  onError?: (error: Error) => void,
): () => void {
  if (!isFirebaseConfigured()) {
    onData(getDefaultSiteNavigation());
    return () => undefined;
  }

  const db = getClientFirestore();

  return onSnapshot(
    doc(db, NAVIGATION_DOC),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(getDefaultSiteNavigation());
        return;
      }

      onData(mapNavigation(snapshot.data()));
    },
    (error) => onError?.(error),
  );
}

export async function saveSiteNavigation(
  input: SiteNavigationInput,
): Promise<void> {
  const db = getClientFirestore();
  const payload = sanitizeNavigationInput(input);

  await setDoc(doc(db, NAVIGATION_DOC), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}
