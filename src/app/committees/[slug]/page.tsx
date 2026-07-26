import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { aboutContent } from "@/lib/about";
import {
  getStandingCommittee,
  getStandingCommitteeSlugs,
  standingCommittees,
} from "@/lib/committees";
import { siteConfig } from "@/lib/data";
import { siteContainer } from "@/lib/layout";
import { cardSurface } from "@/lib/styles";

interface CommitteePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getStandingCommitteeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CommitteePageProps): Promise<Metadata> {
  const { slug } = await params;
  const committee = getStandingCommittee(slug);

  if (!committee) {
    return { title: "Committee" };
  }

  return {
    title: committee.name,
    description: committee.summary,
    openGraph: {
      title: `${committee.name} | ${siteConfig.name}`,
      description: committee.summary,
      url: `${siteConfig.url}/committees/${committee.slug}`,
    },
  };
}

export default async function CommitteePage({ params }: CommitteePageProps) {
  const { slug } = await params;
  const committee = getStandingCommittee(slug);

  if (!committee) {
    notFound();
  }

  const Icon = committee.icon;
  const index = standingCommittees.findIndex((item) => item.slug === slug);
  const previous = index > 0 ? standingCommittees[index - 1] : null;
  const next =
    index >= 0 && index < standingCommittees.length - 1
      ? standingCommittees[index + 1]
      : null;

  return (
    <>
      <main className="min-h-svh bg-background pt-28 pb-20">
        <div className={siteContainer}>
          <div className="mx-auto max-w-3xl">
            <Link
              href="/committees"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              All Standing Committees
            </Link>

            <div className={`mt-8 p-6 sm:p-8 ${cardSurface}`}>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Standing Committee
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
                {committee.name}
              </h1>
              <div className="mt-4 h-px w-12 bg-secondary" aria-hidden />
              <p className="mt-5 text-base leading-relaxed text-neutral-700 md:text-lg">
                {committee.summary}
              </p>

              <h2 className="mt-8 font-display text-lg font-bold text-neutral-900">
                Areas of focus
              </h2>
              <ul className="mt-3 space-y-2.5">
                {committee.focus.map((item) => (
                  <li key={item} className="flex gap-3 text-neutral-700">
                    <span
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-8 text-sm leading-relaxed text-muted">
                {aboutContent.standingCommitteesNote}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              {previous ? (
                <Link
                  href={`/committees/${previous.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {previous.name}
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/committees/${next.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  {next.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
