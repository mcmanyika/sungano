import {
  BarChart3,
  Calendar,
  Clapperboard,
  Contact,
  HandCoins,
  Home,
  ImageIcon,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Newspaper,
  PanelTop,
  ScrollText,
  ShoppingBag,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  id: string;
  label: string;
  items: AdminNavItem[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        description: "Stats, queues, and activity",
        icon: Home,
      },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      {
        href: "/admin/landing",
        label: "Landing page",
        description: "Show or hide sections",
        icon: LayoutDashboard,
      },
      {
        href: "/admin/news",
        label: "News",
        description: "Articles and updates",
        icon: Newspaper,
      },
      {
        href: "/admin/events",
        label: "Events",
        description: "Upcoming gatherings",
        icon: Calendar,
      },
      {
        href: "/admin/videos",
        label: "Videos",
        description: "Gallery & hero clip",
        icon: Clapperboard,
      },
      {
        href: "/admin/images",
        label: "Images",
        description: "Homepage gallery",
        icon: ImageIcon,
      },
      {
        href: "/admin/declaration",
        label: "Declaration",
        description: "Harare statement",
        icon: ScrollText,
      },
    ],
  },
  {
    id: "engagement",
    label: "Engagement",
    items: [
      {
        href: "/admin/comments",
        label: "Comments",
        description: "Moderate discussion",
        icon: MessageSquare,
      },
      {
        href: "/admin/contact",
        label: "Contact",
        description: "Inbound messages",
        icon: Contact,
      },
      {
        href: "/admin/polls",
        label: "Polls",
        description: "Public surveys",
        icon: BarChart3,
      },
      {
        href: "/admin/emails",
        label: "Emails",
        description: "Inbox and sync",
        icon: Inbox,
      },
    ],
  },
  {
    id: "community",
    label: "Community",
    items: [
      {
        href: "/admin/volunteers",
        label: "Volunteers",
        description: "Registrations",
        icon: UserPlus,
      },
      {
        href: "/admin/subscribers",
        label: "Subscribers",
        description: "Stay Informed list",
        icon: Mail,
      },
    ],
  },
  {
    id: "commerce",
    label: "Commerce & site",
    items: [
      {
        href: "/admin/donations",
        label: "Donations",
        description: "Gifts and charts",
        icon: HandCoins,
      },
      {
        href: "/admin/store",
        label: "Store",
        description: "Merchandise",
        icon: ShoppingBag,
      },
      {
        href: "/admin/navigation",
        label: "Navigation",
        description: "Header and footer",
        icon: PanelTop,
      },
    ],
  },
];

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findActiveAdminItem(pathname: string): AdminNavItem | null {
  for (const group of adminNavGroups) {
    for (const item of group.items) {
      if (isAdminNavActive(pathname, item.href)) {
        return item;
      }
    }
  }

  return null;
}
