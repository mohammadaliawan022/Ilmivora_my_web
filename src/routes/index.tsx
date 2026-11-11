import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookMarked,
  Clock,
  Layers,
  BookOpen,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { recentMcqsQuery } from "@/shared/data/queries";
import { getSubjectCounts } from "@/shared/data/mcq-repo";
import { EXAM_CATEGORIES } from "@/shared/exam-categories";
import { EXAM_SECONDS_PER_QUESTION } from "@/shared/mcq";
import { GK_DOMAIN, POPULAR_SUBJECT_SLUGS, SUBJECT_GROUPS, SUBJECTS, getSubjectBySlug } from "@/shared/subjects";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const subjects = await getSubjectCounts();
      return { subjects };
    } catch {
      return { subjects: {} };
    }
  },
  head: () => ({
    meta: [
      { title: "Ilmivora — Prepare Smarter for PPSC, FPSC & NTS" },
      {
        name: "description",
        content:
          "Thousands of subject-wise MCQs with answers and explanations, practice tests and timed exam mode for competitive exam preparation in Pakistan.",
      },
      { property: "og:title", content: "Ilmivora — Prepare Smarter. Achieve More." },
      {
        property: "og:description",
        content: "Subject-based MCQ practice and exam preparation for aspirants across Pakistan.",
      },
    ],
    links: [{ rel: "canonical", href: "https://ilmivora-1.vercel.app/" }],
  }),
  component: Index,
});

function Index() {
  const { subjects } = Route.useLoaderData();
  return (
    <>
      <HomeWelcome />
      <Hero />
      <ExamSources />
      <Stats counts={subjects} />
      <PopularSubjects counts={subjects} />
      <PastPapersCallout />
      <FeaturedGroups counts={subjects} />
      <RecentMcqs />
    </>
  );
}

function HomeWelcome() {
  return (
    <section className="container-page flex items-end justify-between gap-6 pb-5 pt-10 md:pt-12">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Your space to get ahead.</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">Build your knowledge, one question at a time.</p>
      </div>
      <p className="hidden items-center gap-2 pb-1 text-sm text-muted-foreground sm:flex">
        <Sparkles aria-hidden="true" className="h-4 w-4 text-primary" /> A fresh start, every day
      </p>
    </section>
  );
}

function Hero() {
  return (
    <section className="container-page">
      <div className="home-hero relative overflow-hidden rounded-[2rem] border border-primary/5 bg-primary-soft px-7 py-10 md:px-12 md:py-14 lg:grid lg:min-h-[340px] lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-8">
        <div className="pointer-events-none absolute right-[-4rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full border-[1.5rem] border-primary/[0.035] md:right-10 md:top-[-10rem]" aria-hidden="true" />
        <div className="pointer-events-none absolute right-[-1rem] top-[-5rem] hidden h-[22rem] w-[22rem] rounded-full border-[1.5rem] border-primary/[0.04] lg:block" aria-hidden="true" />
        <div className="relative z-10 max-w-xl animate-rise">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">For your next big opportunity</p>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
            Big goals.<br /><span className="font-medium italic text-primary">Small daily steps.</span>
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
            Make exam preparation a little more manageable. Practise, understand, and move forward with confidence.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button size="lg" asChild><Link to="/practice">Start practising <ArrowRight /></Link></Button>
            <Link to="/past-papers" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              Explore past papers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <QuickStartCard />
      </div>
    </section>
  );
}

function QuickStartCard() {
  return (
    <div className="relative z-10 mx-auto mt-10 w-full max-w-sm lg:mt-0 lg:rotate-[-2deg]">
      <div className="card-surface relative rounded-2xl p-6 shadow-card md:p-7">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Your quick start</p>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-warning-soft text-warning"><Sparkles aria-hidden="true" className="h-4 w-4" /></span>
        </div>
        <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">A little bit of everything.</h3>
        <p className="mt-2 text-sm text-muted-foreground">Warm up with a short mixed practice set.</p>
        <div className="mt-5 flex gap-2 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-2"><BookOpen className="h-3.5 w-3.5" /> 5 questions</span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-2"><Clock className="h-3.5 w-3.5" /> At your pace</span>
        </div>
        <Button className="mt-5 w-full" size="lg" asChild><Link to="/practice">Try a quick practice <ArrowRight /></Link></Button>
      </div>
      <p className="absolute -bottom-4 right-2 rounded-lg bg-primary-soft px-3 py-2 text-xs font-semibold text-primary shadow-soft">Progress over perfection.</p>
    </div>
  );
}

function ExamSources() {
  const sources = EXAM_CATEGORIES.filter((category) => ["PPSC", "FPSC", "NTS"].includes(category.code));
  return (
    <section className="container-page py-7">
      <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <span className="font-medium">Prepare for</span>
        {sources.map((source, index) => (
          <span key={source.code} className="flex items-center gap-4">
            {index > 0 && <span aria-hidden="true" className="text-border">|</span>}
            <Link to="/search" search={{ exam: source.code }} className="text-foreground hover:text-primary">{source.code}</Link>
          </span>
        ))}
        <span aria-hidden="true" className="text-border">|</span><span className="font-normal normal-case tracking-normal">and your next opportunity</span>
      </p>
    </section>
  );
}

function PastPapersCallout() {
  return (
    <section className="container-page pt-4">
      <div className="flex flex-col gap-5 rounded-2xl bg-warning-soft/70 p-5 sm:flex-row sm:items-center sm:justify-between md:px-7">
        <div className="flex items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-card text-primary"><BookMarked aria-hidden="true" className="h-5 w-5" /></span>
          <div>
            <h2 className="font-semibold">Get familiar with the exam.</h2>
            <p className="mt-1 text-sm text-muted-foreground">Explore representative paper sets for PPSC, FPSC and NTS.</p>
          </div>
        </div>
        <Button variant="outline" asChild><Link to="/past-papers">Browse past papers <ArrowRight /></Link></Button>
      </div>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { to: "/subjects" | "/search" | "/general-knowledge"; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold md:text-4xl">{title}</h2>
      </div>
      {action && (
        <Button variant="ghost" asChild>
          <Link to={action.to}>
            {action.label} <ArrowRight />
          </Link>
        </Button>
      )}
    </div>
  );
}

function PopularSubjects({ counts }: { counts: Record<string, number> }) {
  const popular = POPULAR_SUBJECT_SLUGS.flatMap((slug) => {
    const subject = getSubjectBySlug(slug);
    return subject && (counts[subject.name] ?? 0) > 0 ? [subject] : [];
  });
  if (!popular.length) return null;
  const descriptions: Record<string, string> = {
    "General Knowledge": "The world, its people and places",
    "Pakistan Studies": "History, heritage and constitution",
    "Islamic Studies": "Foundations, history and knowledge",
    English: "Grammar, vocabulary and expression",
    "Computer Science": "Computing, networks and technology",
    "Everyday Science": "The science of everyday life",
    Mathematics: "Numbers, reasoning and problem solving",
    "Current Affairs": "Global institutions and public affairs",
  };
  const iconSurfaces = ["bg-primary-soft", "bg-warning-soft", "bg-violet-soft", "bg-secondary", "bg-danger-soft", "bg-primary-soft", "bg-warning-soft", "bg-violet-soft"];
  return (
    <section className="container-page py-12 md:py-16">
      <SectionHead
        eyebrow="Choose a subject"
        title="What will you learn today?"
        action={{ to: "/subjects", label: `All ${Object.values(counts).filter((n) => n > 0).length} subjects` }}
      />
      <p className="mt-1 text-sm text-muted-foreground">Pick a subject. Find your rhythm.</p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {popular.map((subject, index) => (
          <Link
            key={subject.slug}
            to={subject.slug === "general-knowledge" ? "/general-knowledge" : "/subjects/$slug"}
            params={{ slug: subject.slug }}
            className="card-surface card-interactive group flex min-h-52 flex-col rounded-2xl p-5"
          >
            <div className="flex items-start justify-between">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${iconSurfaces[index % iconSurfaces.length]} text-foreground/80`}>
                <subject.icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <span className="rounded-md bg-secondary px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">Practice</span>
            </div>
            <span className="mt-5 font-display text-base font-semibold">{subject.name}</span>
            <span className="mt-1 text-xs leading-relaxed text-muted-foreground">{descriptions[subject.name] ?? subject.group}</span>
            <span className="mt-auto flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
              {(counts[subject.name] ?? 0).toLocaleString()} practice MCQs
              <ArrowRight aria-hidden="true" className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedGroups({ counts }: { counts: Record<string, number> }) {
  const available = SUBJECTS.filter((subject) => (counts[subject.name] ?? 0) > 0);
  const groups = SUBJECT_GROUPS.filter((group) => group !== GK_DOMAIN && available.some((subject) => subject.group === group));
  if (!groups.length) return null;
  return (
    <section className="container-page py-20">
      <SectionHead eyebrow="Fields of study" title="Explore by field of study" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {groups.map((g, i) => {
          const subjects = available.filter((s) => s.group === g);
          return (
            <Link
              key={g}
              to="/subjects"
              search={{ group: g }}
              className={
                "card-surface card-interactive flex flex-col justify-between p-6 " +
                (i === 0 ? "md:row-span-2 bg-brand text-primary-foreground" : "")
              }
            >
              <div>
                <h3 className={i === 0 ? "text-3xl font-bold" : "text-xl font-bold"}>{g}</h3>
                <p className={i === 0 ? "mt-1 text-sm opacity-80" : "mt-1 text-sm text-muted-foreground"}>
                  {subjects.length} subjects
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-1.5">
                {subjects.map((s) => (
                  <span
                    key={s.slug}
                    className={
                      i === 0
                        ? "rounded-full bg-primary-foreground/15 px-2.5 py-1 text-xs font-medium"
                        : "rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function RecentMcqs() {
  const { data, isPending, isError } = useQuery(recentMcqsQuery(6));
  return (
    <section className="bg-secondary/60 py-20">
      <div className="container-page">
        <SectionHead
          eyebrow="Recently added"
          title="Fresh MCQs this week"
          action={{ to: "/search", label: "Browse all MCQs" }}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isPending &&
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          {isError && <p className="text-sm text-muted-foreground">Couldn't load recent MCQs.</p>}
          {data?.map((m) => (
            <Link
              key={m.id}
              to="/search"
              search={{ q: m.question.slice(0, 40) }}
              className="card-surface card-interactive flex flex-col gap-3 p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge variant="soft">{m.subject}</Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="line-clamp-2 font-medium leading-snug">{m.question}</p>
              {m.exam_category && (
                <span className="mt-auto text-xs font-semibold text-violet">{m.exam_category}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats({ counts }: { counts: Record<string, number> }) {
  const totalQuestions = Object.values(counts).reduce((total, count) => total + count, 0);
  const availableSubjects = Object.values(counts).filter((count) => count > 0).length;
  const stats = [
    { icon: Layers, value: totalQuestions.toLocaleString(), label: "MCQs to explore", note: "A growing foundation" },
    { icon: BookOpen, value: String(availableSubjects), label: "Subjects in one place", note: "Find your starting point" },
    { icon: Target, value: `${EXAM_SECONDS_PER_QUESTION}s`, label: "Per exam question", note: "Build your accuracy" },
  ];
  return (
    <section className="container-page py-3">
      <div className="grid gap-3 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="card-surface flex items-center gap-4 rounded-2xl p-4 md:p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><stat.icon aria-hidden="true" className="h-5 w-5" /></span>
            <div className="min-w-0"><p className="font-display text-2xl font-bold">{stat.value}</p><p className="text-xs text-muted-foreground">{stat.label}</p></div>
            <span className="ml-auto hidden max-w-24 text-right text-[10px] leading-relaxed text-muted-foreground sm:block">{stat.note}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
