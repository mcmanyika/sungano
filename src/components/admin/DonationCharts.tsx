"use client";

import { useMemo, useState } from "react";
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
import { cardSurface } from "@/lib/styles";
import {
  describeInterval,
  formatDonationAmount,
  type Donation,
  type DonationInterval,
} from "@/types/donation";

const CHART_COLORS = {
  primary: "#0F3D91",
  accent: "#1F8A70",
  secondary: "#C9A227",
  muted: "#94A3B8",
  failed: "#DC2626",
};

const INTERVAL_COLORS: Record<DonationInterval, string> = {
  one_time: CHART_COLORS.primary,
  month: CHART_COLORS.accent,
  year: CHART_COLORS.secondary,
};

const STATUS_COLORS: Record<string, string> = {
  succeeded: CHART_COLORS.accent,
  pending: CHART_COLORS.secondary,
  failed: CHART_COLORS.failed,
  refunded: CHART_COLORS.muted,
};

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
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

function ChartCard({
  title,
  description,
  children,
  footer,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl p-5 ${cardSurface}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-neutral-900">
            {title}
          </h3>
          {description ? (
            <p className="mt-0.5 text-xs text-muted">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="h-64 w-full">{children}</div>
      {footer}
    </div>
  );
}

export function DonationCharts({ donations }: { donations: Donation[] }) {
  const currencies = useMemo(() => {
    const set = new Set<string>();
    for (const donation of donations) {
      if (donation.status === "succeeded") {
        set.add(donation.currency.toUpperCase());
      }
    }
    return Array.from(set).sort();
  }, [donations]);

  const [currency, setCurrency] = useState<string>("");
  const activeCurrency = currency || currencies[0] || "USD";

  const monthlyTrend = useMemo(() => {
    const keys = lastTwelveMonthKeys();
    const buckets = new Map(
      keys.map((key) => [key, { month: monthLabel(key), gifts: 0, amount: 0 }]),
    );

    for (const donation of donations) {
      if (!donation.createdAt || donation.status !== "succeeded") {
        continue;
      }

      const key = monthKey(donation.createdAt);
      const bucket = buckets.get(key);
      if (!bucket) {
        continue;
      }

      bucket.gifts += 1;
      if (donation.currency.toUpperCase() === activeCurrency) {
        bucket.amount += donation.amount;
      }
    }

    return keys.map((key) => buckets.get(key)!);
  }, [donations, activeCurrency]);

  const intervalBreakdown = useMemo(() => {
    const counts: Record<DonationInterval, number> = {
      one_time: 0,
      month: 0,
      year: 0,
    };

    for (const donation of donations) {
      if (donation.status !== "succeeded") {
        continue;
      }
      counts[donation.interval] += 1;
    }

    return (Object.keys(counts) as DonationInterval[])
      .map((interval) => ({
        name: describeInterval(interval),
        value: counts[interval],
        interval,
      }))
      .filter((item) => item.value > 0);
  }, [donations]);

  const statusBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const donation of donations) {
      counts.set(donation.status, (counts.get(donation.status) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([status, value]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value,
        status,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [donations]);

  if (donations.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard
        title="Monthly gifts"
        description="Succeeded donations in the last 12 months"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
              cursor={{ fill: "rgba(15, 61, 145, 0.06)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="gifts"
              name="Gifts"
              fill={CHART_COLORS.primary}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Amount raised"
        description={`Succeeded totals in ${activeCurrency} (last 12 months)`}
        action={
          currencies.length > 1 ? (
            <select
              value={activeCurrency}
              onChange={(event) => setCurrency(event.target.value)}
              className="h-9 rounded-full border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              {currencies.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          ) : null
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="donationAmountFill" x1="0" y1="0" x2="0" y2="1">
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
                formatDonationAmount(Number(value ?? 0), activeCurrency),
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
              fill="url(#donationAmountFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Gift type"
        description="Succeeded donations by interval"
        footer={
          intervalBreakdown.length > 0 ? (
            <ul className="mt-3 flex flex-wrap justify-center gap-3">
              {intervalBreakdown.map((entry) => (
                <li
                  key={entry.interval}
                  className="flex items-center gap-1.5 text-xs text-neutral-600"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: INTERVAL_COLORS[entry.interval] }}
                  />
                  {entry.name} ({entry.value})
                </li>
              ))}
            </ul>
          ) : null
        }
      >
        {intervalBreakdown.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No succeeded gifts yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={intervalBreakdown}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={3}
              >
                {intervalBreakdown.map((entry) => (
                  <Cell
                    key={entry.interval}
                    fill={INTERVAL_COLORS[entry.interval]}
                  />
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

      <ChartCard
        title="Status mix"
        description="All recorded donations"
        footer={
          <ul className="mt-3 flex flex-wrap justify-center gap-3">
            {statusBreakdown.map((entry) => (
              <li
                key={entry.status}
                className="flex items-center gap-1.5 text-xs text-neutral-600"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      STATUS_COLORS[entry.status] ?? CHART_COLORS.muted,
                  }}
                />
                {entry.name} ({entry.value})
              </li>
            ))}
          </ul>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusBreakdown}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={3}
            >
              {statusBreakdown.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={STATUS_COLORS[entry.status] ?? CHART_COLORS.muted}
                />
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
      </ChartCard>
    </div>
  );
}
