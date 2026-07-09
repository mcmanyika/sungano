import {
  BookOpen,
  FileText,
  Handshake,
  Heart,
  Megaphone,
  MessageCircle,
} from "lucide-react";

export const siteConfig = {
  name: "Sungano Yevanhu",
  shortName: "Sungano Yevanhu",
  initials: "SY",
  eyebrow: "UBUMBANO LOMPHAKATHI",
  tagline: "Restore the Constitution. Restore Our Democracy.",
  url: "https://sunganoyevanhu.org",
  email: "info@sunganoyevanhu.org",
};

export const navLinks = [
  { label: "About", href: "#rights" },
  { label: "News", href: "#news" },
  { label: "FAQ", href: "#faq" },
];

export const timelineEvents = [
  {
    year: "2024",
    title: "Constitutional Amendment Act No. 6 Assented",
    description:
      "Constitutional Amendment Act No. 6 was assented to, prompting widespread public concern about constitutional integrity.",
  },
  {
    year: "2024",
    title: "Public Appeals for Referendum",
    description:
      "Citizens and civil society organizations appealed for a national referendum on the constitutional changes.",
  },
  {
    year: "2024",
    title: "Appeals for Constitutional Court Opinion",
    description:
      "Formal requests were made for a Constitutional Court opinion on the legality and implications of the amendment.",
  },
  {
    year: "2024",
    title: "Requests Not Adopted",
    description:
      "Calls for referendum and judicial review were not adopted through the channels requested by the public.",
  },
  {
    year: "2025",
    title: "Movement Launched",
    description:
      "Sungano Yevanhu was launched as a peaceful, lawful response committed to democratic restoration.",
  },
];

export const constitutionalRights = [
  {
    title: "Freedom of Assembly",
    description:
      "Every person has the right to assemble and associate with others, and to form and belong to political parties and civil society organizations.",
  },
  {
    title: "Peaceful Demonstration",
    description:
      "Every person has the right to demonstrate and to present petitions, peacefully and unarmed, in accordance with the law.",
  },
  {
    title: "Freedom of Expression",
    description:
      "Every person has the right to freedom of expression, which includes freedom to seek, receive and communicate ideas and information.",
  },
  {
    title: "Political Rights",
    description:
      "Every Zimbabwean citizen has the right to free, fair and regular elections and to make political choices freely.",
  },
];

export const campaignActivities = [
  {
    title: "Civic Education",
    description:
      "Workshops and materials that help citizens understand constitutional rights, duties, and lawful pathways to change.",
    icon: BookOpen,
  },
  {
    title: "Community Dialogues",
    description:
      "Inclusive conversations across communities to build shared understanding and peaceful consensus.",
    icon: MessageCircle,
  },
  {
    title: "Petitions",
    description:
      "Lawful petition drives that amplify the voice of citizens through organized, documented civic action.",
    icon: FileText,
  },
  {
    title: "Prayer Gatherings",
    description:
      "Faith-centered gatherings for unity, reflection, and peaceful commitment to constitutional restoration.",
    icon: Heart,
  },
  {
    title: "Peaceful Demonstrations",
    description:
      "Organized, lawful demonstrations conducted with dignity, discipline, and respect for all.",
    icon: Megaphone,
  },
  {
    title: "Stakeholder Consultations",
    description:
      "Engagement with legal experts, community leaders, and institutions to advance constitutional dialogue.",
    icon: Handshake,
  },
];

export const newsArticles = [
  {
    id: 1,
    title: "Movement Launches Nationwide Civic Education Campaign",
    category: "Campaign",
    date: "March 12, 2025",
    excerpt:
      "Volunteers across provinces begin hosting community sessions on constitutional rights and lawful civic participation.",
    image: "/images/news-civic-education.jpg",
  },
  {
    id: 2,
    title: "Legal Experts Outline Path to Constitutional Review",
    category: "Justice",
    date: "February 28, 2025",
    excerpt:
      "Constitutional scholars explain how judicial review and civic advocacy can work together for democratic restoration.",
    image: "/images/news-legal-review.jpg",
  },
  {
    id: 3,
    title: "Harare Declaration Signed by Community Leaders",
    category: "Declaration",
    date: "February 15, 2025",
    excerpt:
      "Faith, youth, and civic leaders unite behind a shared commitment to peaceful constitutional restoration.",
    image: "/images/news-declaration.jpg",
  },
];

export const faqItems = [
  {
    question: "What is Sungano Yevanhu?",
    answer:
      "Sungano Yevanhu is a peaceful national civic movement committed to defending constitutional democracy through lawful action, civic participation, and justice. We seek to restore constitutional supremacy and strengthen democratic governance.",
  },
  {
    question: "How can I participate?",
    answer:
      "You can volunteer in your province, attend civic education sessions, join community dialogues, sign petitions, participate in peaceful demonstrations, or partner as an organization. Contact us to connect with your local coordinator.",
  },
  {
    question: "Is participation peaceful?",
    answer:
      "Yes. Peaceful, lawful engagement is a core principle of our movement. All activities are conducted in accordance with the Constitution and applicable laws, with respect for the rights of all citizens.",
  },
  {
    question: "Can organizations partner?",
    answer:
      "Yes. Churches, civil society organizations, professional associations, and community groups that share our commitment to constitutional democracy are welcome to partner with us.",
  },
  {
    question: "How do I receive updates?",
    answer:
      "Subscribe to our newsletter or contact your provincial coordinator. Follow us on social media for announcements about events, resources, and campaign activities.",
  },
];

export const footerLinks = {
  about: [
    { label: "About", href: "#rights" },
    { label: "Leadership", href: "#contact" },
    { label: "News", href: "#news" },
  ],
  resources: [
    { label: "Legal Documents", href: "#declaration" },
    { label: "Volunteer", href: "#contact" },
    { label: "Contact", href: "#contact" },
  ],
  legal: [{ label: "Privacy Policy", href: "#" }],
};

export const stats = [
  { label: "Provinces Active", value: 10, suffix: "" },
  { label: "Community Events", value: 150, suffix: "+" },
  { label: "Citizens Engaged", value: 25000, suffix: "+" },
  { label: "Partner Organizations", value: 85, suffix: "+" },
];
