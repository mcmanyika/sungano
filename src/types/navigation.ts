export interface SiteLink {
  id: string;
  label: string;
  /** Empty string or "#" means non-navigating for now. */
  href: string;
}

export interface HeaderLink extends SiteLink {
  /** Opens the About mega menu instead of navigating. */
  megaMenu?: boolean;
}

export type SocialPlatform =
  | "facebook"
  | "x"
  | "youtube"
  | "instagram"
  | "tiktok"
  | "whatsapp";

export const SOCIAL_PLATFORMS: readonly SocialPlatform[] = [
  "facebook",
  "x",
  "youtube",
  "instagram",
  "tiktok",
  "whatsapp",
] as const;

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  href: string;
}

export interface AboutMenuConfig {
  intro: SiteLink;
  sectionTitle: string;
  sectionDescription: string;
  items: SiteLink[];
}

export interface FooterLinksConfig {
  about: SiteLink[];
  links: SiteLink[];
  legal: SiteLink[];
}

export interface SiteNavigation {
  header: HeaderLink[];
  donate: SiteLink;
  aboutMenu: AboutMenuConfig;
  footer: FooterLinksConfig;
  social: SocialLink[];
  updatedAt: Date | null;
}

export interface SiteNavigationInput {
  header: HeaderLink[];
  donate: SiteLink;
  aboutMenu: AboutMenuConfig;
  footer: FooterLinksConfig;
  social: SocialLink[];
}

export function isNavigableHref(href: string): boolean {
  const value = href.trim();
  return value.length > 0 && value !== "#";
}

export function createLinkId(prefix = "link"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }

  return `${prefix}-${Date.now().toString(36)}`;
}

export const DEFAULT_SITE_NAVIGATION: SiteNavigationInput = {
  header: [
    {
      id: "header-about",
      label: "About",
      href: "/about",
      megaMenu: true,
    },
    { id: "header-news", label: "News", href: "/news" },
    { id: "header-store", label: "Store", href: "/store" },
    { id: "header-contact", label: "Contact", href: "#contact" },
  ],
  donate: { id: "header-donate", label: "DONATE NOW", href: "/donate" },
  aboutMenu: {
    intro: {
      id: "about-intro",
      label: "About the Coalition",
      href: "/about",
    },
    sectionTitle: "Standing Committees",
    sectionDescription: "Nine committees carry out the Coalition’s work.",
    items: [
      {
        id: "committee-legal",
        label: "Legal and Constitutional Affairs",
        href: "",
      },
      {
        id: "committee-comms",
        label: "Information and Communications",
        href: "",
      },
      { id: "committee-mobilisation", label: "Mobilisation", href: "" },
      { id: "committee-women", label: "Women and Gender", href: "" },
      { id: "committee-youth", label: "Youth and Students", href: "" },
      {
        id: "committee-regional",
        label: "Regional and International Relations",
        href: "",
      },
      {
        id: "committee-solidarity",
        label: "Solidarity and Support",
        href: "",
      },
      { id: "committee-security", label: "Security", href: "" },
      {
        id: "committee-finance",
        label: "Finance and Administration",
        href: "",
      },
    ],
  },
  footer: {
    about: [
      { id: "footer-about", label: "About", href: "/about" },
      { id: "footer-news", label: "News", href: "/news" },
      { id: "footer-store", label: "Store", href: "/store" },
      { id: "footer-videos", label: "Videos", href: "#videos" },
      {
        id: "footer-organisations",
        label: "Organisations",
        href: "/about#join",
      },
    ],
    links: [
      {
        id: "footer-dcp",
        label: "Defend the Constitution Platform",
        href: "https://www.dcpzim.com",
      },
      {
        id: "footer-cdf",
        label: "Constitution Defenders Forum",
        href: "https://www.cdfzim.org",
      },
      {
        id: "footer-nca",
        label: "National Constitutional Assembly",
        href: "#",
      },
    ],
    legal: [
      { id: "footer-privacy", label: "Privacy Policy", href: "#" },
    ],
  },
  social: [
    {
      id: "social-facebook",
      platform: "facebook",
      label: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61591849589672",
    },
    {
      id: "social-x",
      platform: "x",
      label: "X",
      href: "https://x.com/sunganoyevanhu",
    },
    {
      id: "social-youtube",
      platform: "youtube",
      label: "YouTube",
      href: "https://www.youtube.com/@SunganoUbumbano",
    },
    {
      id: "social-instagram",
      platform: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/SunganoUbumbano",
    },
    {
      id: "social-tiktok",
      platform: "tiktok",
      label: "TikTok",
      href: "https://www.tiktok.com/@ubumbanosungano",
    },
    {
      id: "social-whatsapp",
      platform: "whatsapp",
      label: "WhatsApp",
      href: "https://wa.me/14697992071",
    },
  ],
};
