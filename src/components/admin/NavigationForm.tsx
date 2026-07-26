"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  getSiteNavigation,
  saveSiteNavigation,
} from "@/lib/firebase/navigation";
import { cardSurface } from "@/lib/styles";
import {
  createLinkId,
  DEFAULT_SITE_NAVIGATION,
  SOCIAL_PLATFORMS,
  type HeaderLink,
  type SiteLink,
  type SiteNavigationInput,
  type SocialLink,
  type SocialPlatform,
} from "@/types/navigation";

function emptyLink(prefix: string): SiteLink {
  return {
    id: createLinkId(prefix),
    label: "",
    href: "",
  };
}

function LinkRows({
  title,
  description,
  links,
  onChange,
  showMegaMenu,
}: {
  title: string;
  description?: string;
  links: HeaderLink[] | SiteLink[];
  onChange: (links: HeaderLink[]) => void;
  showMegaMenu?: boolean;
}) {
  function updateAt(index: number, patch: Partial<HeaderLink>) {
    onChange(
      links.map((link, linkIndex) =>
        linkIndex === index ? { ...link, ...patch } : link,
      ),
    );
  }

  return (
    <section className={`space-y-4 p-6 ${cardSurface} rounded-2xl`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-neutral-900">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-sm text-muted">{description}</p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            onChange([
              ...links,
              {
                ...emptyLink("nav"),
                megaMenu: false,
              },
            ])
          }
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add link
        </Button>
      </div>

      <div className="space-y-3">
        {links.map((link, index) => (
          <div
            key={link.id}
            className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto]"
          >
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                Label
              </label>
              <input
                required
                value={link.label}
                onChange={(event) =>
                  updateAt(index, { label: event.target.value })
                }
                className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                Href
              </label>
              <input
                value={link.href}
                onChange={(event) =>
                  updateAt(index, { href: event.target.value })
                }
                placeholder="/about, #news, or leave blank"
                className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <div className="flex items-end gap-2">
              {showMegaMenu ? (
                <label className="mb-2 flex items-center gap-2 text-xs text-neutral-600">
                  <input
                    type="checkbox"
                    checked={Boolean(
                      "megaMenu" in link ? link.megaMenu : false,
                    )}
                    onChange={(event) =>
                      updateAt(index, { megaMenu: event.target.checked })
                    }
                  />
                  Mega menu
                </label>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  onChange(links.filter((_, linkIndex) => linkIndex !== index))
                }
                className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:border-red-200 hover:text-red-600"
                aria-label={`Remove ${link.label || "link"}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function NavigationForm() {
  const [form, setForm] = useState<SiteNavigationInput>(DEFAULT_SITE_NAVIGATION);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadNavigation() {
      setLoading(true);
      setError("");

      try {
        const navigation = await getSiteNavigation();
        setForm({
          header: navigation.header,
          donate: navigation.donate,
          aboutMenu: navigation.aboutMenu,
          footer: navigation.footer,
          social: navigation.social,
        });
      } catch {
        setError("Unable to load site navigation.");
      } finally {
        setLoading(false);
      }
    }

    void loadNavigation();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await saveSiteNavigation(form);
      setSuccess("Navigation links saved.");
    } catch {
      setError("Unable to save navigation. Check your admin permissions.");
    } finally {
      setSaving(false);
    }
  }

  function updateSocial(index: number, patch: Partial<SocialLink>) {
    setForm((current) => ({
      ...current,
      social: current.social.map((link, linkIndex) =>
        linkIndex === index ? { ...link, ...patch } : link,
      ),
    }));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <LinkRows
        title="Header links"
        description="Mark one link as Mega menu to open the About panel. Leave href blank to disable navigation."
        links={form.header}
        showMegaMenu
        onChange={(header) => setForm((current) => ({ ...current, header }))}
      />

      <section className={`space-y-4 p-6 ${cardSurface} rounded-2xl`}>
        <h3 className="font-display text-lg font-semibold text-neutral-900">
          Donate button
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
              Label
            </label>
            <input
              required
              value={form.donate.label}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  donate: { ...current.donate, label: event.target.value },
                }))
              }
              className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
              Href
            </label>
            <input
              required
              value={form.donate.href}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  donate: { ...current.donate, href: event.target.value },
                }))
              }
              className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>
      </section>

      <section className={`space-y-4 p-6 ${cardSurface} rounded-2xl`}>
        <h3 className="font-display text-lg font-semibold text-neutral-900">
          About mega menu
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
              Intro label
            </label>
            <input
              required
              value={form.aboutMenu.intro.label}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  aboutMenu: {
                    ...current.aboutMenu,
                    intro: {
                      ...current.aboutMenu.intro,
                      label: event.target.value,
                    },
                  },
                }))
              }
              className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
              Intro href
            </label>
            <input
              value={form.aboutMenu.intro.href}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  aboutMenu: {
                    ...current.aboutMenu,
                    intro: {
                      ...current.aboutMenu.intro,
                      href: event.target.value,
                    },
                  },
                }))
              }
              className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
              Section title
            </label>
            <input
              required
              value={form.aboutMenu.sectionTitle}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  aboutMenu: {
                    ...current.aboutMenu,
                    sectionTitle: event.target.value,
                  },
                }))
              }
              className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
              Section description
            </label>
            <input
              value={form.aboutMenu.sectionDescription}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  aboutMenu: {
                    ...current.aboutMenu,
                    sectionDescription: event.target.value,
                  },
                }))
              }
              className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>
      </section>

      <LinkRows
        title="About menu items"
        description="Committee and related links shown in the About mega menu."
        links={form.aboutMenu.items}
        onChange={(items) =>
          setForm((current) => ({
            ...current,
            aboutMenu: { ...current.aboutMenu, items },
          }))
        }
      />

      <LinkRows
        title="Footer · About"
        links={form.footer.about}
        onChange={(about) =>
          setForm((current) => ({
            ...current,
            footer: { ...current.footer, about },
          }))
        }
      />

      <LinkRows
        title="Footer · Links"
        links={form.footer.links}
        onChange={(links) =>
          setForm((current) => ({
            ...current,
            footer: { ...current.footer, links },
          }))
        }
      />

      <LinkRows
        title="Footer · Legal"
        links={form.footer.legal}
        onChange={(legal) =>
          setForm((current) => ({
            ...current,
            footer: { ...current.footer, legal },
          }))
        }
      />

      <section className={`space-y-4 p-6 ${cardSurface} rounded-2xl`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-neutral-900">
              Social links
            </h3>
            <p className="mt-1 text-sm text-muted">
              Platform icons are fixed; update labels and URLs here.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setForm((current) => ({
                ...current,
                social: [
                  ...current.social,
                  {
                    id: createLinkId("social"),
                    platform: "facebook",
                    label: "",
                    href: "",
                  },
                ],
              }))
            }
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add social
          </Button>
        </div>

        <div className="space-y-3">
          {form.social.map((link, index) => (
            <div
              key={link.id}
              className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:grid-cols-[160px_1fr_1fr_auto]"
            >
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                  Platform
                </label>
                <select
                  value={link.platform}
                  onChange={(event) =>
                    updateSocial(index, {
                      platform: event.target.value as SocialPlatform,
                    })
                  }
                  className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                  Label
                </label>
                <input
                  required
                  value={link.label}
                  onChange={(event) =>
                    updateSocial(index, { label: event.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                  Href
                </label>
                <input
                  value={link.href}
                  onChange={(event) =>
                    updateSocial(index, { href: event.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      social: current.social.filter(
                        (_, linkIndex) => linkIndex !== index,
                      ),
                    }))
                  }
                  className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:border-red-200 hover:text-red-600"
                  aria-label={`Remove ${link.label || "social link"}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save navigation"
          )}
        </Button>
      </div>
    </form>
  );
}
