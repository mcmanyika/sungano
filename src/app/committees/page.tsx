import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { aboutContent } from "@/lib/about";
import { standingCommittees } from "@/lib/committees";
import { siteConfig } from "@/lib/data";
import { siteContainer } from "@/lib/layout";
import { cardSurface } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Standing Committees",
  description:
    "Sungano Ubumbano implements its work through nine Standing Committees spanning legal affairs, communications, mobilisation, gender, youth, and more.",
  openGraph: {
    title: `Standing Committees | ${siteConfig.name}`,
    description:
      "Explore the nine Standing Committees that carry out the Coalition’s constitutional work.",
    url: `${siteConfig.url}/committees`,
  },
};

export default function CommitteesPage() {
  return (
    <>
      <main className="min-h-svh bg-background pt-28 pb-20">
        <div className={siteContainer}>
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Our structure
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
              Standing Committees
            </h1>
            <div className="mx-auto mt-5 h-px w-12 bg-secondary" aria-hidden />
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
              The Coalition implements its work through nine Standing
              Committees. Leadership of each committee is appointed by the
              Coalition Executive Committee.
            </p>
          </header>

          <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {standingCommittees.map((committee) => {
              const Icon = committee.icon;
              return (
                <Link
                  key={committee.slug}
                  href={`/committees/${committee.slug}`}
                  className={`group flex flex-col p-5 transition hover:-translate-y-0.5 ${cardSurface}`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-4 font-display text-lg font-bold tracking-tight text-neutral-900 group-hover:text-primary">
                    {committee.name}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    {committee.summary}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    View committee
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>

          <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-relaxed text-muted">
            {aboutContent.standingCommitteesNote}
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
