import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarCheck2,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";

const OFFICIAL_PORTALS = [
  {
    name: "Punjab Public Service Commission",
    shortName: "PPSC",
    description: "Punjab government posts, advertisements, eligibility details and application instructions.",
    href: "https://www.ppsc.gop.pk/",
    type: "Punjab recruitment",
  },
  {
    name: "Federal Public Service Commission",
    shortName: "FPSC",
    description: "Federal vacancies, CSS notices, general recruitment advertisements and candidate applications.",
    href: "https://www.fpsc.gov.pk/",
    type: "Federal recruitment",
  },
  {
    name: "National Jobs Portal",
    shortName: "NJP",
    description: "Vacancies published by verified Government of Pakistan organisations.",
    href: "https://www.njp.gov.pk/index.php/jobs",
    type: "Federal job portal",
  },
  {
    name: "Punjab Job Portal",
    shortName: "PJP",
    description: "Search and apply for vacancies posted by Punjab government departments.",
    href: "https://jobs.punjab.gov.pk/new_recruit/jobs",
    type: "Punjab job portal",
  },
  {
    name: "Khyber Pakhtunkhwa Job Portal",
    shortName: "KP Jobs",
    description: "Browse vacancies and recruitment notices from Khyber Pakhtunkhwa departments.",
    href: "https://jobs.kp.gov.pk/",
    type: "Khyber Pakhtunkhwa",
  },
  {
    name: "Sindh Public Service Commission",
    shortName: "SPSC",
    description: "Sindh government service advertisements, application notices and candidate updates.",
    href: "https://spsc.gov.pk/advertisement.php",
    type: "Sindh recruitment",
  },
  {
    name: "National Testing Service",
    shortName: "NTS",
    description: "Open recruitment projects and application notices administered through NTS.",
    href: "https://www.nts.org.pk/new/projectsnew.php",
    type: "Testing and recruitment projects",
  },
] as const;

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Government Jobs in Pakistan | Ilmivora" },
      {
        name: "description",
        content: "Find official PPSC, FPSC, NTS and government job portals in Pakistan, with safe application and deadline-checking guidance.",
      },
      { property: "og:title", content: "Government Jobs in Pakistan | Ilmivora" },
      { property: "og:description", content: "Quick links to official job advertisements and application portals for Pakistan's public-sector vacancies." },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ilmivora-1.vercel.app/jobs" }],
  }),
  component: JobsPage,
});

function JobsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Career opportunities"
        title="Find your next opportunity"
        description="Browse official government recruitment portals and check each vacancy’s eligibility, deadline and application instructions at the source."
      />

      <div className="container-page py-10 md:py-14">
        <section className="mb-8 flex gap-4 rounded-2xl border border-primary/20 bg-primary-soft p-5 md:p-6" aria-label="Important notice">
          <ShieldCheck aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
          <div>
            <h2 className="font-display text-lg font-bold">Apply through the official portal</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Ilmivora shares links to recruitment sources; it does not accept job applications or verify individual vacancies. Always confirm the advertisement, eligibility and closing date on the relevant government website before applying or paying a fee.
            </p>
          </div>
        </section>

        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Official sources</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Government job portals</h2>
          </div>
          <span className="hidden text-sm text-muted-foreground sm:inline">{OFFICIAL_PORTALS.length} verified links</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {OFFICIAL_PORTALS.map((portal) => (
            <article key={portal.shortName} className="card-surface flex min-h-56 flex-col p-5 transition-colors hover:border-primary/40">
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary" aria-hidden="true">
                  <BriefcaseBusiness className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{portal.type}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{portal.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{portal.description}</p>
              <a
                href={portal.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View {portal.shortName} opportunities
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </article>
          ))}
        </div>

        <section className="mt-12 grid gap-8 rounded-2xl border border-border bg-card p-6 md:grid-cols-[1fr_1.2fr] md:p-8" aria-labelledby="apply-safely">
          <div>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <ClipboardList aria-hidden="true" className="h-5 w-5" />
            </div>
            <h2 id="apply-safely" className="font-display text-2xl font-bold">Before you apply</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A careful check can help you avoid missed deadlines and misleading job advertisements.
            </p>
          </div>
          <ul className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <li className="flex gap-3"><BadgeCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span><strong className="text-foreground">Check eligibility:</strong> match your qualification, age, domicile and experience to the official advertisement.</span></li>
            <li className="flex gap-3"><CalendarCheck2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span><strong className="text-foreground">Confirm the deadline:</strong> use the closing date shown on the official portal, as dates can change.</span></li>
            <li className="flex gap-3"><ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><span><strong className="text-foreground">Avoid unofficial payments:</strong> follow only the fee and payment instructions printed in the official notice.</span></li>
          </ul>
        </section>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          Ilmivora is an independent educational resource and is not affiliated with any government agency or recruitment commission. Portal links are provided for convenience; the relevant authority’s notice is the final source of information.
        </p>
      </div>
    </>
  );
}
