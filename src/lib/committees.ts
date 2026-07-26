import {
  Banknote,
  GraduationCap,
  Handshake,
  Megaphone,
  Scale,
  Shield,
  Smartphone,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export interface StandingCommittee {
  slug: string;
  name: string;
  summary: string;
  focus: readonly string[];
  icon: LucideIcon;
}

export const standingCommittees: readonly StandingCommittee[] = [
  {
    slug: "legal-and-constitutional-affairs",
    name: "Legal and Constitutional Affairs",
    summary:
      "Guides the Coalition’s constitutional analysis, litigation strategy, and lawful pathways to restore constitutional supremacy.",
    focus: [
      "Constitutional research and legal opinion",
      "Litigation and judicial engagement",
      "Legislative monitoring and rights education",
    ],
    icon: Scale,
  },
  {
    slug: "information-and-communications",
    name: "Information and Communications",
    summary:
      "Shapes public messaging, media relations, and civic information so the Coalition’s constitutional message reaches every province and the diaspora.",
    focus: [
      "Public communications and media liaison",
      "Digital platforms and content",
      "Spokesperson support and messaging discipline",
    ],
    icon: Smartphone,
  },
  {
    slug: "mobilisation",
    name: "Mobilisation",
    summary:
      "Organises peaceful civic mobilisation, community outreach, and coordinated action across member institutions.",
    focus: [
      "Community outreach and campaigns",
      "Institutional coordination",
      "Lawful public engagement",
    ],
    icon: Megaphone,
  },
  {
    slug: "women-and-gender",
    name: "Women and Gender",
    summary:
      "Advances the full participation of women and gender-inclusive approaches in constitutional democracy and Coalition programmes.",
    focus: [
      "Women’s leadership and participation",
      "Gender-responsive civic education",
      "Protection of constitutional rights",
    ],
    icon: Users,
  },
  {
    slug: "youth-and-students",
    name: "Youth and Students",
    summary:
      "Engages young people and student formations in civic education, peaceful activism, and long-term democratic renewal.",
    focus: [
      "Campus and youth networks",
      "Civic education for young citizens",
      "Leadership development",
    ],
    icon: GraduationCap,
  },
  {
    slug: "regional-and-international-relations",
    name: "Regional and International Relations",
    summary:
      "Builds constructive regional and international relationships that support constitutional democracy and solidarity with the people of Zimbabwe.",
    focus: [
      "Regional diplomatic and civic engagement",
      "International solidarity networks",
      "Diaspora liaison",
    ],
    icon: Handshake,
  },
  {
    slug: "solidarity-and-support",
    name: "Solidarity and Support",
    summary:
      "Coordinates practical solidarity, welfare support, and mutual assistance for communities and institutions advancing constitutional work.",
    focus: [
      "Mutual aid and support networks",
      "Institutional solidarity",
      "Community resilience",
    ],
    icon: UsersRound,
  },
  {
    slug: "security",
    name: "Security",
    summary:
      "Promotes the safety, dignity, and lawful protection of Coalition participants through risk awareness and peaceful security practice.",
    focus: [
      "Participant safety and risk awareness",
      "Peaceful event protocols",
      "Coordination with lawful authorities where appropriate",
    ],
    icon: Shield,
  },
  {
    slug: "finance-and-administration",
    name: "Finance and Administration",
    summary:
      "Stewards the Coalition’s financial integrity, administration, and accountable use of resources in service of constitutional objectives.",
    focus: [
      "Financial stewardship and transparency",
      "Administrative systems",
      "Resource planning and reporting",
    ],
    icon: Banknote,
  },
] as const;

export function getStandingCommittee(
  slug: string,
): StandingCommittee | undefined {
  return standingCommittees.find((committee) => committee.slug === slug);
}

export function getStandingCommitteeSlugs(): string[] {
  return standingCommittees.map((committee) => committee.slug);
}
