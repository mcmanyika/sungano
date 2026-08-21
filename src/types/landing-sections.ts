export const LANDING_SECTION_IDS = [
  "hero",
  "about",
  "gallery",
  "news",
  "polls",
  "stayInformed",
  "donationTracker",
  "store",
  "volunteer",
  "contact",
] as const;

export type LandingSectionId = (typeof LANDING_SECTION_IDS)[number];

export const HERO_VARIANTS = ["default", "banner"] as const;
export type HeroVariant = (typeof HERO_VARIANTS)[number];

export type LandingSections = Record<LandingSectionId, boolean> & {
  heroVariant: HeroVariant;
  heroBannerUrl: string;
  heroBannerPath: string;
};

export const HERO_VARIANT_META: Record<
  HeroVariant,
  { label: string; description: string }
> = {
  default: {
    label: "Default",
    description: "Current banner with volunteer registration.",
  },
  banner: {
    label: "Banner",
    description: "Full-width banner with the same copy and stats. Upload a custom image below.",
  },
};

export const LANDING_SECTION_META: Record<
  LandingSectionId,
  { label: string; description: string }
> = {
  hero: {
    label: "Hero",
    description: "Top banner, declaration button, and stats.",
  },
  about: {
    label: "Who We Are",
    description: "Coalition intro and welcome video.",
  },
  gallery: {
    label: "Photo gallery",
    description: "Homepage image gallery.",
  },
  news: {
    label: "News",
    description: "Latest published articles.",
  },
  polls: {
    label: "Polls",
    description: "Public surveys.",
  },
  stayInformed: {
    label: "Stay Informed",
    description: "Email subscribe band.",
  },
  donationTracker: {
    label: "Donation tracker",
    description: "Fundraising progress bar.",
  },
  store: {
    label: "Store",
    description: "Merchandise grid.",
  },
  volunteer: {
    label: "Volunteer",
    description: "Volunteer registration call to action.",
  },
  contact: {
    label: "Contact us",
    description: "Contact form and WhatsApp.",
  },
};

export const DEFAULT_LANDING_SECTIONS: LandingSections = {
  hero: true,
  about: true,
  gallery: true,
  news: true,
  polls: true,
  stayInformed: true,
  donationTracker: true,
  store: true,
  volunteer: true,
  contact: true,
  heroVariant: "default",
  heroBannerUrl: "",
  heroBannerPath: "",
};

export function isLandingSectionId(value: string): value is LandingSectionId {
  return (LANDING_SECTION_IDS as readonly string[]).includes(value);
}

export function isHeroVariant(value: unknown): value is HeroVariant {
  return (
    typeof value === "string" &&
    (HERO_VARIANTS as readonly string[]).includes(value)
  );
}
