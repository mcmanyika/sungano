"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminNavGroups } from "@/components/admin/admin-nav";
import { subscribeToAllComments } from "@/lib/firebase/comments";
import { subscribeToContactMessages } from "@/lib/firebase/contacts";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribeToAllDonations } from "@/lib/firebase/donations";
import { getAllEvents } from "@/lib/firebase/events";
import { subscribeToInboundEmails } from "@/lib/firebase/inbound-emails";
import { getAllNewsArticles } from "@/lib/firebase/news";
import { subscribeToAllPolls } from "@/lib/firebase/polls";
import { getAllProducts } from "@/lib/firebase/products";
import { getAllSubscribers } from "@/lib/firebase/subscribers";
import { getAllVolunteers } from "@/lib/firebase/volunteers";
import { cardSurface } from "@/lib/styles";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types/comment";
import type { ContactMessage } from "@/types/contact";
import {
  formatDonationAmount,
  type Donation,
} from "@/types/donation";
import { formatEventDate, type EventItem } from "@/types/event";
import type { InboundEmail } from "@/types/inbound-email";
import type { NewsArticle } from "@/types/news";
import type { Poll } from "@/types/poll";
import type { StoreProduct } from "@/types/store";
import type { Subscriber } from "@/types/subscriber";
import {
  VOLUNTEER_INTERESTS,
  type Volunteer,
} from "@/types/volunteer";

const CHART_COLORS = {
  primary: "#0F3D91",
  accent: "#1F8A70",
  secondary: "#C9A227",
  muted: "#94A3B8",
  rose: "#E11D48",
  indigo: "#4F46E5",
};

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.accent,
  CHART_COLORS.secondary,
  CHART_COLORS.indigo,
  CHART_COLORS.rose,
  CHART_COLORS.muted,
];

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(new Date(year, month - 1, 1));
}

function lastTwelveMonthKeys(now = new Date()): string[] {
  const keys: string[] = [];
  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(date));
  }
  return keys;
}

function isWithinDays(date: Date | null, days: number, now = new Date()): boolean {
  if (!date) {
    return false;
  }

  return now.getTime() - date.getTime() <= days * 24 * 60 * 60 * 1000;
}

function formatRelative(date: Date | null): string {
  if (!date) {
    return "—";
  }

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) {
    return "Just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function ChartCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl p-5 ${cardSurface}`}>
      <div className="mb-4">
        <h3 className="font-display text-base font-bold text-neutral-900">
          {title}
        </h3>
        {description ? (
          <p className="mt-0.5 text-xs text-muted">{description}</p>
        ) : null}
      </div>
      <div className="h-64 w-full">{children}</div>
      {footer}
    </div>
  );
}

function StatCard({
  href,
  label,
  value,
  hint,
  tone = "default",
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "alert";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-2xl p-4 transition hover:-translate-y-0.5",
        cardSurface,
        tone === "alert" && "border-red-200/80",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {label}
        </p>
        <ArrowUpRight className="h-4 w-4 text-neutral-300 transition group-hover:text-primary" />
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-neutral-900 sm:text-3xl">
        {value}
      </p>
      <p
        className={cn(
          "mt-1 text-xs",
          tone === "alert" ? "font-medium text-red-600" : "text-muted",
        )}
      >
        {hint}
      </p>
    </Link>
  );
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  detail: string;
  at: Date | null;
  href: string;
}

export function AdminDashboard() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [emails, setEmails] = useState<InboundEmail[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loadingLive, setLoadingLive] = useState(true);
  const [loadingSnapshot, setLoadingSnapshot] = useState(true);
  const [error, setError] = useState("");

  const loadSnapshot = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setLoadingSnapshot(false);
      return;
    }

    setLoadingSnapshot(true);

    try {
      const [nextVolunteers, nextSubscribers, nextArticles, nextEvents, nextProducts] =
        await Promise.all([
          getAllVolunteers(),
          getAllSubscribers(),
          getAllNewsArticles(),
          getAllEvents(),
          getAllProducts(),
        ]);

      setVolunteers(nextVolunteers);
      setSubscribers(nextSubscribers);
      setArticles(nextArticles);
      setEvents(nextEvents);
      setProducts(nextProducts);
      setError("");
    } catch {
      setError("Some dashboard lists could not be loaded.");
    } finally {
      setLoadingSnapshot(false);
    }
  }, []);

  useEffect(() => {
    loadSnapshot();
  }, [loadSnapshot]);

  useEffect(() => {
    const loaded = {
      donations: false,
      comments: false,
      contacts: false,
      emails: false,
      polls: false,
    };

    function markLive(key: keyof typeof loaded) {
      loaded[key] = true;
      if (Object.values(loaded).every(Boolean)) {
        setLoadingLive(false);
      }
    }

    const unsubscribers = [
      subscribeToAllDonations(
        (next) => {
          setDonations(next);
          markLive("donations");
        },
        () => {
          setError("Unable to load live donation data.");
          markLive("donations");
        },
      ),
      subscribeToAllComments(
        (next) => {
          setComments(next);
          markLive("comments");
        },
        () => {
          setError("Unable to load comments.");
          markLive("comments");
        },
      ),
      subscribeToContactMessages(
        (next) => {
          setContacts(next);
          markLive("contacts");
        },
        () => {
          setError("Unable to load contact messages.");
          markLive("contacts");
        },
      ),
      subscribeToInboundEmails(
        (next) => {
          setEmails(next);
          markLive("emails");
        },
        () => {
          setError("Unable to load inbox.");
          markLive("emails");
        },
      ),
      subscribeToAllPolls(
        (next) => {
          setPolls(next);
          markLive("polls");
        },
        () => {
          setError("Unable to load polls.");
          markLive("polls");
        },
      ),
    ];

    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
  }, []);

  const succeededDonations = useMemo(
    () => donations.filter((donation) => donation.status === "succeeded"),
    [donations],
  );

  const donationTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const donation of succeededDonations) {
      const currency = donation.currency.toUpperCase();
      totals.set(currency, (totals.get(currency) ?? 0) + donation.amount);
    }
    return Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
  }, [succeededDonations]);

  const unreadEmails = emails.filter((email) => !email.read);
  const pendingComments = comments.filter((comment) => !comment.approved);
  const newContacts = contacts.filter((contact) => contact.status === "new");
  const failedDrafts =
    emails.filter((email) => email.agentStatus === "failed").length +
    comments.filter((comment) => comment.agentStatus === "failed").length;

  const publishedArticles = articles.filter((article) => article.published);
  const newsViews = articles.reduce((sum, article) => sum + article.views, 0);
  const publishedProducts = products.filter((product) => product.published);
  const upcomingEvents = events
    .filter((event) => event.published && event.startAt && event.startAt >= new Date())
    .sort((a, b) => (a.startAt?.getTime() ?? 0) - (b.startAt?.getTime() ?? 0))
    .slice(0, 4);

  const monthlyActivity = useMemo(() => {
    const keys = lastTwelveMonthKeys();
    const buckets = new Map(
      keys.map((key) => [
        key,
        {
          month: monthLabel(key),
          volunteers: 0,
          subscribers: 0,
          donations: 0,
          comments: 0,
          contacts: 0,
        },
      ]),
    );

    const bump = (date: Date | null, field: "volunteers" | "subscribers" | "donations" | "comments" | "contacts") => {
      if (!date) {
        return;
      }
      const bucket = buckets.get(monthKey(date));
      if (bucket) {
        bucket[field] += 1;
      }
    };

    for (const volunteer of volunteers) {
      bump(volunteer.registeredAt, "volunteers");
    }
    for (const subscriber of subscribers) {
      bump(subscriber.subscribedAt, "subscribers");
    }
    for (const donation of succeededDonations) {
      bump(donation.createdAt, "donations");
    }
    for (const comment of comments) {
      bump(comment.createdAt, "comments");
    }
    for (const contact of contacts) {
      bump(contact.createdAt, "contacts");
    }

    return keys.map((key) => buckets.get(key)!);
  }, [comments, contacts, subscribers, succeededDonations, volunteers]);

  const monthlyRaised = useMemo(() => {
    const keys = lastTwelveMonthKeys();
    const primaryCurrency = donationTotals[0]?.[0] ?? "USD";
    const buckets = new Map(
      keys.map((key) => [key, { month: monthLabel(key), amount: 0 }]),
    );

    for (const donation of succeededDonations) {
      if (!donation.createdAt || donation.currency.toUpperCase() !== primaryCurrency) {
        continue;
      }
      const bucket = buckets.get(monthKey(donation.createdAt));
      if (bucket) {
        bucket.amount += donation.amount;
      }
    }

    return {
      currency: primaryCurrency,
      rows: keys.map((key) => buckets.get(key)!),
    };
  }, [donationTotals, succeededDonations]);

  const volunteerInterests = useMemo(() => {
    const counts = new Map<string, number>();
    for (const interest of VOLUNTEER_INTERESTS) {
      counts.set(interest, 0);
    }
    for (const volunteer of volunteers) {
      const key = volunteer.interest || "General Support";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [volunteers]);

  const volunteerSources = useMemo(() => {
    const web = volunteers.filter((volunteer) => volunteer.source === "web").length;
    const whatsapp = volunteers.filter((volunteer) => volunteer.source === "whatsapp").length;
    return [
      { name: "Web", value: web },
      { name: "WhatsApp", value: whatsapp },
    ].filter((item) => item.value > 0);
  }, [volunteers]);

  const pollVotes = useMemo(
    () =>
      polls
        .map((poll) => ({
          name: poll.question.length > 28 ? `${poll.question.slice(0, 28)}…` : poll.question,
          votes: poll.totalVotes,
        }))
        .filter((item) => item.votes > 0)
        .slice(0, 6),
    [polls],
  );

  const queues = [
    {
      href: "/admin/emails",
      label: "Unread emails",
      count: unreadEmails.length,
      icon: Inbox,
    },
    {
      href: "/admin/comments",
      label: "Pending comments",
      count: pendingComments.length,
      icon: MessageSquare,
    },
    {
      href: "/admin/contact",
      label: "New contacts",
      count: newContacts.length,
      icon: Mail,
    },
    {
      href: "/admin/emails",
      label: "Failed AI drafts",
      count: failedDrafts,
      icon: AlertCircle,
    },
  ];

  const recentActivity = useMemo(() => {
    const items: ActivityItem[] = [
      ...volunteers.slice(0, 8).map((volunteer) => ({
        id: `volunteer-${volunteer.id}`,
        type: "Volunteer",
        title: volunteer.fullName || volunteer.email,
        detail: volunteer.interest || "Registration",
        at: volunteer.registeredAt,
        href: "/admin/volunteers",
      })),
      ...subscribers.slice(0, 8).map((subscriber) => ({
        id: `subscriber-${subscriber.id}`,
        type: "Subscriber",
        title: subscriber.email,
        detail: subscriber.source,
        at: subscriber.subscribedAt,
        href: "/admin/subscribers",
      })),
      ...succeededDonations.slice(0, 8).map((donation) => ({
        id: `donation-${donation.id}`,
        type: "Donation",
        title: donation.donorName || donation.email,
        detail: formatDonationAmount(donation.amount, donation.currency),
        at: donation.createdAt,
        href: "/admin/donations",
      })),
      ...comments.slice(0, 8).map((comment) => ({
        id: `comment-${comment.id}`,
        type: comment.approved ? "Comment" : "Pending comment",
        title: comment.authorName,
        detail: comment.articleTitle,
        at: comment.createdAt,
        href: "/admin/comments",
      })),
      ...contacts.slice(0, 8).map((contact) => ({
        id: `contact-${contact.id}`,
        type: "Contact",
        title: contact.fullName || contact.email,
        detail: contact.subject || contact.topic,
        at: contact.createdAt,
        href: "/admin/contact",
      })),
      ...emails.slice(0, 8).map((email) => ({
        id: `email-${email.id}`,
        type: email.read ? "Email" : "Unread email",
        title: email.subject,
        detail: email.from,
        at: email.receivedAt,
        href: "/admin/emails",
      })),
    ];

    return items
      .sort((a, b) => (b.at?.getTime() ?? 0) - (a.at?.getTime() ?? 0))
      .slice(0, 10);
  }, [comments, contacts, emails, subscribers, succeededDonations, volunteers]);

  const loading = loadingLive || loadingSnapshot;
  const dataLinks = adminNavGroups
    .filter((group) => group.id !== "overview")
    .flatMap((group) => group.items);

  const raisedHint =
    donationTotals.length === 0
      ? "No succeeded gifts yet"
      : donationTotals
          .slice(0, 2)
          .map(([currency, amount]) => formatDonationAmount(amount, currency))
          .join(" · ");

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900">
            Data overview
          </h2>
          <p className="mt-1 text-sm text-muted">
            Community, engagement, content, and gifts in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadSnapshot()}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 transition hover:border-primary/20 hover:text-primary"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh lists
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          href="/admin/volunteers"
          label="Volunteers"
          value={String(volunteers.length)}
          hint={`${volunteers.filter((volunteer) => isWithinDays(volunteer.registeredAt, 7)).length} new this week`}
        />
        <StatCard
          href="/admin/subscribers"
          label="Subscribers"
          value={String(subscribers.length)}
          hint={`${subscribers.filter((subscriber) => isWithinDays(subscriber.subscribedAt, 7)).length} new this week`}
        />
        <StatCard
          href="/admin/donations"
          label="Donations"
          value={String(succeededDonations.length)}
          hint={raisedHint}
        />
        <StatCard
          href="/admin/emails"
          label="Unread inbox"
          value={String(unreadEmails.length)}
          hint={`${emails.length} messages total`}
          tone={unreadEmails.length > 0 ? "alert" : "default"}
        />
        <StatCard
          href="/admin/comments"
          label="Pending comments"
          value={String(pendingComments.length)}
          hint={`${comments.length} comments total`}
          tone={pendingComments.length > 0 ? "alert" : "default"}
        />
        <StatCard
          href="/admin/contact"
          label="New contacts"
          value={String(newContacts.length)}
          hint={`${contacts.length} messages total`}
          tone={newContacts.length > 0 ? "alert" : "default"}
        />
        <StatCard
          href="/admin/news"
          label="News"
          value={String(publishedArticles.length)}
          hint={`${newsViews.toLocaleString()} article views`}
        />
        <StatCard
          href="/admin/store"
          label="Store"
          value={String(publishedProducts.length)}
          hint={`${products.length} products total`}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Activity"
          description="New records over the last 12 months"
          footer={
            <ul className="mt-3 flex flex-wrap justify-center gap-3">
              {[
                { name: "Volunteers", color: CHART_COLORS.primary },
                { name: "Subscribers", color: CHART_COLORS.accent },
                { name: "Donations", color: CHART_COLORS.secondary },
                { name: "Comments", color: CHART_COLORS.indigo },
                { name: "Contacts", color: CHART_COLORS.muted },
              ].map((entry) => (
                <li
                  key={entry.name}
                  className="flex items-center gap-1.5 text-xs text-neutral-600"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}
                </li>
              ))}
            </ul>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyActivity} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6B7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#6B7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="volunteers"
                name="Volunteers"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                fill="url(#activityFill)"
              />
              <Area
                type="monotone"
                dataKey="subscribers"
                name="Subscribers"
                stroke={CHART_COLORS.accent}
                strokeWidth={2}
                fill="transparent"
              />
              <Area
                type="monotone"
                dataKey="donations"
                name="Donations"
                stroke={CHART_COLORS.secondary}
                strokeWidth={2}
                fill="transparent"
              />
              <Area
                type="monotone"
                dataKey="comments"
                name="Comments"
                stroke={CHART_COLORS.indigo}
                strokeWidth={2}
                fill="transparent"
              />
              <Area
                type="monotone"
                dataKey="contacts"
                name="Contacts"
                stroke={CHART_COLORS.muted}
                strokeWidth={2}
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Amount raised"
          description={`Succeeded gifts in ${monthlyRaised.currency} (last 12 months)`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyRaised.rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="raisedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.accent} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={CHART_COLORS.accent} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6B7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6B7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                formatter={(value) => [
                  formatDonationAmount(Number(value ?? 0), monthlyRaised.currency),
                  "Raised",
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                name="Raised"
                stroke={CHART_COLORS.accent}
                strokeWidth={2}
                fill="url(#raisedFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Volunteer interests"
          description="Where people want to help"
        >
          {volunteerInterests.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              No volunteer registrations yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volunteerInterests}
                layout="vertical"
                margin={{ top: 8, right: 12, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={118}
                  tick={{ fill: "#6B7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" name="Volunteers" fill={CHART_COLORS.primary} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title={pollVotes.length > 0 ? "Poll votes" : "Volunteer sources"}
          description={
            pollVotes.length > 0
              ? "Total votes on published and draft polls"
              : "How people registered"
          }
          footer={
            pollVotes.length === 0 && volunteerSources.length > 0 ? (
              <ul className="mt-3 flex flex-wrap justify-center gap-3">
                {volunteerSources.map((entry, index) => (
                  <li key={entry.name} className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index] }}
                    />
                    {entry.name} ({entry.value})
                  </li>
                ))}
              </ul>
            ) : null
          }
        >
          {pollVotes.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pollVotes} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6B7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={48}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="votes" name="Votes" fill={CHART_COLORS.secondary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : volunteerSources.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              No source data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={volunteerSources}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                >
                  {volunteerSources.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className={`rounded-2xl p-5 ${cardSurface}`}>
          <h3 className="font-display text-base font-bold text-neutral-900">
            Needs attention
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            Queues that still need a response or review.
          </p>
          <ul className="mt-4 space-y-2">
            {queues.map((queue) => {
              const Icon = queue.icon;
              return (
                <li key={queue.label}>
                  <Link
                    href={queue.href}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition hover:bg-neutral-50"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg",
                          queue.count > 0
                            ? "bg-red-50 text-red-600"
                            : "bg-neutral-100 text-neutral-500",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium text-neutral-800">
                        {queue.label}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-sm font-semibold",
                        queue.count > 0
                          ? "bg-red-50 text-red-700"
                          : "bg-neutral-100 text-neutral-500",
                      )}
                    >
                      {queue.count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 border-t border-neutral-100 pt-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-800">
              <Calendar className="h-4 w-4 text-primary" />
              Upcoming events
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted">No published upcoming events.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingEvents.map((event) => (
                  <li key={event.id}>
                    <Link
                      href="/admin/events"
                      className="block rounded-xl px-3 py-2 transition hover:bg-neutral-50"
                    >
                      <p className="text-sm font-medium text-neutral-900">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted">
                        {formatEventDate(event.startAt)}
                        {event.location ? ` · ${event.location}` : ""}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={`rounded-2xl p-5 ${cardSurface}`}>
          <h3 className="font-display text-base font-bold text-neutral-900">
            Recent activity
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            Latest registrations, gifts, messages, and comments.
          </p>
          {recentActivity.length === 0 ? (
            <p className="mt-8 text-sm text-muted">No activity recorded yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-md text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 text-[11px] uppercase tracking-[0.12em] text-muted">
                    <th className="pb-2 font-semibold">Type</th>
                    <th className="pb-2 font-semibold">Record</th>
                    <th className="pb-2 font-semibold">When</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((item) => (
                    <tr key={item.id} className="border-b border-neutral-50 last:border-0">
                      <td className="py-2.5 pr-3">
                        <Link
                          href={item.href}
                          className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 hover:bg-primary/10 hover:text-primary"
                        >
                          {item.type}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-3">
                        <Link href={item.href} className="block hover:text-primary">
                          <span className="font-medium text-neutral-900">
                            {item.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">
                            {item.detail}
                          </span>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap py-2.5 text-xs text-muted">
                        {formatRelative(item.at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className={`rounded-2xl p-5 ${cardSurface}`}>
        <h3 className="font-display text-base font-bold text-neutral-900">
          Manage data
        </h3>
        <p className="mt-0.5 text-xs text-muted">
          Jump into a collection to add, edit, or moderate records.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {dataLinks.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-neutral-50"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-neutral-900">
                      {item.label}
                    </span>
                    <span className="block text-xs text-muted">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="flex items-center gap-2 text-xs text-muted">
        <UserPlus className="h-3.5 w-3.5" />
        {volunteers.filter((volunteer) => volunteer.source === "whatsapp").length}{" "}
        volunteers registered through WhatsApp.
      </p>
    </div>
  );
}
