import { Footer } from "@/components/layout/Footer";
import { JoinCoalitionCta } from "@/components/about/JoinCoalitionCta";
import { aboutContent } from "@/lib/about";
import { siteContainer } from "@/lib/layout";
import { cn } from "@/lib/utils";

function AboutBlock({
  id,
  title,
  children,
  className,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-28", className)}>
      <h2 className="font-display text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
        {title}
      </h2>
      <div className="mt-4 h-px w-12 bg-secondary" aria-hidden />
      <div className="mt-6 space-y-4 text-base leading-relaxed text-neutral-700 md:text-[17px]">
        {children}
      </div>
    </section>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function AboutPageView() {
  const about = aboutContent;

  return (
    <>
      <main className="min-h-svh bg-background pt-28 pb-20">
        <div className={siteContainer}>
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              About Us
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
              {about.fullName}
            </h1>
            <p className="mt-3 font-display text-lg font-semibold text-primary md:text-xl">
              ({about.translation})
            </p>
            <div className="mx-auto mt-6 h-px w-12 bg-secondary" aria-hidden />
          </header>

          <div className="mx-auto mt-16 max-w-3xl space-y-16 md:mt-20 md:space-y-20">
            <AboutBlock id="who-we-are" title="Who We Are">
              <p>{about.whoWeAre.lead}</p>
              <p>{about.whoWeAre.body}</p>
              <p className="font-medium text-neutral-900">
                The Coalition was established by the following Founding Member
                Institutions:
              </p>
              <ul className="space-y-2">
                {about.foundingMembers.map((member) => (
                  <li key={member.name} className="flex gap-3">
                    <span
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden
                    />
                    {member.href ? (
                      <a
                        href={member.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        {member.name}
                      </a>
                    ) : (
                      <span>{member.name}</span>
                    )}
                  </li>
                ))}
              </ul>
              <p>{about.whoWeAre.closing}</p>
            </AboutBlock>

            <AboutBlock id="our-name" title="Our Name">
              <p className="font-display text-xl font-bold text-neutral-900">
                {about.ourName.title}
              </p>
              <p>{about.ourName.meaning}</p>
              <p>{about.ourName.reflection}</p>
              {about.ourName.clarification.map((line) => (
                <p key={line} className="font-medium text-neutral-900">
                  {line}
                </p>
              ))}
            </AboutBlock>

            <AboutBlock id="philosophy" title="Our Philosophical Foundation">
              <p className="font-display text-xl font-bold text-neutral-900">
                {about.philosophy.title}
              </p>
              <p className="text-primary font-semibold">
                {about.philosophy.subtitle}
              </p>
              <p>{about.philosophy.intro}</p>
              <p className="font-medium text-neutral-900">
                Our philosophy rests on four central convictions:
              </p>
              <BulletList items={about.philosophy.convictions} />
              <p>{about.philosophy.closing}</p>
            </AboutBlock>

            <AboutBlock id="stand-for" title="What We Stand For">
              <p>
                Sungano yeVanhu – Ubumbano Lomphakathi is founded upon:
              </p>
              <BulletList items={about.standFor} />
              <p className="border-l-2 border-secondary/60 pl-4 text-neutral-800">
                {about.standForNote}
              </p>
            </AboutBlock>

            <AboutBlock id="vision" title="Our Vision">
              <p>{about.vision}</p>
            </AboutBlock>

            <AboutBlock id="mission" title="Our Mission">
              <p>{about.mission}</p>
            </AboutBlock>

            <AboutBlock id="objectives" title="Our Objectives">
              <p>The Coalition works to:</p>
              <BulletList items={about.objectives} />
            </AboutBlock>

            <AboutBlock id="membership" title="Our Membership">
              <p>{about.membership.intro}</p>
              <p className="font-medium text-neutral-900">
                The Coalition includes:
              </p>
              <div className="space-y-5">
                {about.membership.tiers.map((tier) => (
                  <div key={tier.title}>
                    <h3 className="font-display text-lg font-bold text-neutral-900">
                      {tier.title}
                    </h3>
                    <p className="mt-1.5">{tier.description}</p>
                  </div>
                ))}
              </div>
              <p>{about.membership.closing}</p>
            </AboutBlock>

            <AboutBlock id="leadership" title="Our Leadership">
              <p>{about.leadership.intro}</p>
              <BulletList
                items={[
                  "The Convenor",
                  "The Deputy Convenor",
                  "The Coalition Principals",
                ]}
              />
              <div className="space-y-6 pt-2">
                {about.leadership.roles.map((role) => (
                  <div key={role.title}>
                    <h3 className="font-display text-lg font-bold text-neutral-900">
                      {role.title}
                    </h3>
                    <p className="mt-1.5">{role.description}</p>
                  </div>
                ))}
              </div>
              <p className="font-medium text-neutral-900">
                The Principals include the heads of:
              </p>
              <BulletList
                items={about.foundingMembers.map((member) =>
                  member.name.replace(/ \([^)]+\)$/, ""),
                )}
              />
            </AboutBlock>

            <AboutBlock id="organisation" title="How We Are Organised">
              <div className="space-y-10">
                {about.organisation.map((body) => (
                  <div key={body.title}>
                    <h3 className="font-display text-lg font-bold text-neutral-900">
                      {body.title}
                    </h3>
                    <p className="mt-2">{body.description}</p>
                    {body.responsibilities.length > 0 && (
                      <div className="mt-4">
                        {body.title === "Coalition Executive Committee" && (
                          <p className="mb-2 font-medium text-neutral-900">
                            It is responsible for:
                          </p>
                        )}
                        <BulletList items={body.responsibilities} />
                      </div>
                    )}
                    {body.note && <p className="mt-4">{body.note}</p>}
                  </div>
                ))}
              </div>
            </AboutBlock>

            <AboutBlock id="committees" title="Our Standing Committees">
              <p>
                The Coalition implements its work through nine Standing
                Committees:
              </p>
              <BulletList items={about.standingCommittees} />
              <p>{about.standingCommitteesNote}</p>
            </AboutBlock>

            <AboutBlock id="ambassadors" title="Coalition Ambassadors">
              <p>{about.ambassadors}</p>
            </AboutBlock>

            <AboutBlock
              id="peaceful-engagement"
              title="Our Commitment to Peaceful and Lawful Engagement"
            >
              <p>{about.peacefulCommitment.lead}</p>
              <p>{about.peacefulCommitment.body}</p>
              <p className="font-medium text-neutral-900">
                {about.peacefulCommitment.closing}
              </p>
            </AboutBlock>

            <AboutBlock id="legal-status" title="Our Legal Status">
              <p>{about.legalStatus.lead}</p>
              <p>{about.legalStatus.body}</p>
            </AboutBlock>

            <JoinCoalitionCta />

            <section
              id="enduring-message"
              className="rounded-2xl border border-primary/10 bg-primary px-6 py-10 text-center text-white sm:px-10 md:py-12"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary-light">
                Our Enduring Message
              </p>
              <p className="mt-5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {about.enduringMessage.vernacular}
              </p>
              <p className="mt-3 text-lg text-white/85">
                {about.enduringMessage.english}
              </p>
              <div className="mx-auto mt-6 h-px w-12 bg-secondary" aria-hidden />
              <div className="mt-6 space-y-2 text-base text-white/90 sm:text-lg">
                {about.enduringMessage.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
