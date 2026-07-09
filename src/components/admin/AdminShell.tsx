"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, LogOut, Mail, Newspaper } from "lucide-react";
import { useEffect } from "react";
import { logout, useAuth } from "@/hooks/useAuth";
import { siteConfig } from "@/lib/data";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAdmin, configured } = useAuth();
  const isLoginPage = pathname === "/admin/login";

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
      <header className="border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Admin
            </p>
            <h1 className="font-display text-lg font-bold text-neutral-900">
              {siteConfig.shortName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:border-primary/20 hover:text-primary sm:inline-flex"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:border-red-200 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-5 py-8 sm:px-8">
        <aside className="hidden w-52 shrink-0 md:block">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
