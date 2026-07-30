"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  Clapperboard,
  Contact,
  HandCoins,
  ImageIcon,
  Inbox,
  Loader2,
  LogOut,
  Mail,
  MessageSquare,
  Newspaper,
  PanelTop,
  ScrollText,
  ShoppingBag,
  UserPlus,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { logout, useAuth } from "@/hooks/useAuth";
import { siteConfig } from "@/lib/data";
import { cn } from "@/lib/utils";

interface AdminNavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface AdminNavGroup {
  id: string;
  label: string;
  items: AdminNavItem[];
}

const navGroups: AdminNavGroup[] = [
  {
    id: "content",
    label: "Content",
    items: [
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
        description: "Gallery clips",
        icon: Clapperboard,
      },
      {
        href: "/admin/images",
        label: "Images",
        description: "Homepage gallery",
        icon: ImageIcon,
      },
      {
        href: "/admin/video",
        label: "Hero video",
        description: "Welcome embed",
        icon: Video,
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

function isActivePath(pathname: string, href: string) {
  if (href === "/admin/video") {
    return pathname === "/admin/video";
  }

  return pathname.startsWith(href);
}

function findActiveItem(pathname: string): AdminNavItem | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActivePath(pathname, item.href)) {
        return item;
      }
    }
  }
  return null;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAdmin, configured } = useAuth();
  const isLoginPage = pathname === "/admin/login";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const activeItem = findActiveItem(pathname);

  useEffect(() => {
    if (loading || isLoginPage) {
      return;
    }

    if (!configured) {
      return;
    }

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/admin/login?error=unauthorized");
    }
  }, [configured, isAdmin, isLoginPage, loading, router, user]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Admin
              </p>
              <h1 className="truncate font-display text-lg font-bold text-neutral-900">
                {siteConfig.shortName}
              </h1>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-controls={menuId}
                onClick={() => setMenuOpen((open) => !open)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition sm:px-4",
                  menuOpen
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-primary/20 hover:text-primary",
                )}
              >
                {activeItem ? activeItem.label : "Sections"}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition",
                    menuOpen && "rotate-180",
                  )}
                />
              </button>

              {menuOpen ? (
                <div
                  id={menuId}
                  role="menu"
                  aria-label="Admin sections"
                  className="absolute left-0 top-[calc(100%+0.75rem)] z-50 w-[min(calc(100vw-2.5rem),44rem)] overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)] sm:w-[min(calc(100vw-4rem),52rem)]"
                >
                  <div className="border-b border-neutral-100 bg-neutral-50/80 px-5 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      Admin sections
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      Jump to content, engagement, community, or commerce tools.
                    </p>
                  </div>

                  <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-4">
                    {navGroups.map((group) => (
                      <div key={group.id}>
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                          {group.label}
                        </p>
                        <ul className="space-y-1">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            const active = isActivePath(pathname, item.href);

                            return (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  role="menuitem"
                                  className={cn(
                                    "group flex items-start gap-2.5 rounded-xl px-2.5 py-2 transition",
                                    active
                                      ? "bg-primary/10 text-primary"
                                      : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                      active
                                        ? "bg-primary text-white"
                                        : "bg-neutral-100 text-neutral-500 group-hover:bg-primary/10 group-hover:text-primary",
                                    )}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-sm font-semibold leading-tight">
                                      {item.label}
                                    </span>
                                    <span className="mt-0.5 block text-xs leading-snug text-muted">
                                      {item.description}
                                    </span>
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="hidden rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:border-primary/20 hover:text-primary sm:inline-flex"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:border-red-200 hover:text-red-600 sm:px-4"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
