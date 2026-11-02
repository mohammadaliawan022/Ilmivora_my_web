import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookMarked,
  Clock,
  GraduationCap,
  Layers,
  LineChart,
  Sparkles,
  Target,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchBar } from "@/components/site/SearchBar";
import { OptionButton } from "@/components/mcq/OptionButton";
import { recentMcqsQuery } from "@/lib/data/queries";
import { EXAM_CATEGORIES } from "@/lib/exam-categories";
import { GK_CATEGORY_TARGET_COUNT } from "@/lib/gk-categories";
import { EXAM_SECONDS_PER_QUESTION, type OptionLetter } from "@/lib/mcq";
import { POPULAR_SUBJECT_SLUGS, SUBJECT_GROUPS, SUBJECTS, getSubjectBySlug } from "@/lib/subjects";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ilmivora — Prepare Smarter for PPSC, FPSC & NTS" },
      {
        name: "description",
        content:
          "Thousands of MCQs across 36 subjects with practice tests, timed exam mode and progress tracking for Pakistan's competitive exams.",
      },
      { property: "og:title", content: "Ilmivora — Prepare Smarter. Achieve More." },
      {
        property: "og:description",
        content: "MCQ preparation for PPSC, FPSC, NTS and other competitive exams in Pakistan.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <PopularSubjects />
      <ExamCategories />
      <FeaturedGroups />
      <RecentMcqs />
      <Stats />
      <Cta />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero text-navy-foreground">
      <div className="pointer-events-none absolute inset-0 grid-pattern" aria-hidden />
      <span
        className="pointer-events-none absolute -right-10 top-6 select-none font-urdu text-[14rem] leading-none text-navy-foreground/[0.04] md:text-[20rem]"
        aria-hidden
      >
        علم
      </span>
      <div className="container-page relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.15fr_1fr]">
        <div className="animate-rise">
          <Badge className="border-navy-foreground/15 bg-navy-foreground/10 text-navy-foreground">
            <Sparkles className="h-3.5 w-3.5" /> PPSC · FPSC · NTS · and more
          </Badge>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            Prepare Smarter.
            <br />
            <span className="text-brand brightness-150">Achieve More.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-navy-foreground/75 md:text-lg">
            Subject-wise MCQs with clear explanations, instant-feedback practice and a timed exam
            mode built around how Pakistan's commissions actually test.
          </p>
          <SearchBar size="lg" className="mt-8 max-w-xl" />
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="hero" size="lg" asChild>
              <Link to="/practice">
                Start practising <ArrowRight />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/exam">
                <Clock /> Try exam mode
              </Link>
            </Button>
          </div>
        </div>
        <HeroQuestion />
      </div>
    </section>
  );
}

function HeroQuestion() {
  const [chosen, setChosen] = useState<OptionLetter | null>(null);
  const correct: OptionLetter = "B";
  const options: Array<[OptionLetter, string]> = [
    ["A", "Nanga Parbat"],
    ["B", "K2"],
    ["C", "Tirich Mir"],
    ["D", "Broad Peak"],
  ];
  return (
    <div className="relative mx-auto w-full max-w-md lg:animate-float-slow">
      <div className="absolute -inset-4 rounded-[2rem] bg-brand opacity-30 blur-2xl" aria-hidden />
      <div className="card-surface relative p-6 text-card-foreground">
        <div className="flex items-center justify-between">
          <Badge variant="soft">General Knowledge</Badge>
          <span className="text-xs font-semibold text-muted-foreground">Try one</span>
        </div>
        <p className="mt-4 text-lg font-semibold leading-snug">
          Which is the highest mountain peak in Pakistan?
        </p>
        <div className="mt-4 grid gap-2.5">
          {options.map(([l, t]) => (
            <OptionButton
              key={l}
              letter={l}
              text={t}
              disabled={!!chosen}
              state={!chosen ? "idle" : l === correct ? "correct" : l === chosen ? "wrong" : "dimmed"}
              onClick={() => setChosen(l)}
            />
          ))}
        </div>
        <p className="mt-4 min-h-10 text-sm text-muted-foreground">
          {chosen
            ? "K2 (8,611 m) in the Karakoram is Pakistan's highest peak and the world's second highest."
            : "Pick an answer to see instant feedback."}
        </p>
      </div>
    </div>
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

function PopularSubjects() {
  const popular = POPULAR_SUBJECT_SLUGS.map((s) => getSubjectBySlug(s)!).filter(Boolean);
  return (
    <section className="container-page py-20">
      <SectionHead
        eyebrow="Popular subjects"
        title="Where most aspirants begin"
        action={{ to: "/subjects", label: `All ${SUBJECTS.length} subjects` }}
      />
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {popular.map((s) => (
          <Link
            key={s.slug}
            to={s.slug === "general-knowledge" ? "/general-knowledge" : "/subjects/$slug"}
            params={{ slug: s.slug }}
            className="card-surface card-interactive group flex flex-col gap-4 p-5"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <s.icon className="h-5 w-5" />
            </span>
            <span className="font-display text-base font-semibold md:text-lg">{s.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ExamCategories() {
  return (
    <section className="bg-secondary/60 py-20">
      <div className="container-page">
        <SectionHead eyebrow="Browse by exam" title="Prepare for your commission" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EXAM_CATEGORIES.map((c, i) => (
            <Link
              key={c.code}
              to="/search"
              search={{ exam: c.code }}
              className="card-surface card-interactive relative overflow-hidden p-6"
            >
              <span className="font-display text-5xl font-extrabold text-primary/10" aria-hidden>
                0{i + 1}
              </span>
              <h3 className="mt-2 text-2xl font-bold">{c.code === "Other" ? "Others" : c.code}</h3>
              <p className="text-sm font-medium text-foreground/80">{c.name}</p>
              <p className="mt-3 text-sm text-muted-foreground">{c.description}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                View MCQs <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedGroups() {
  return (
    <section className="container-page py-20">
      <SectionHead eyebrow="Featured categories" title="Explore by field of study" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {SUBJECT_GROUPS.filter((g) => g !== "General").map((g, i) => {
          const subjects = SUBJECTS.filter((s) => s.group === g);
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

function Stats() {
  const stats = [
    { icon: BookMarked, value: "10,000+", label: "MCQs with explanations" },
    { icon: Layers, value: String(SUBJECTS.length), label: "Subjects covered" },
    { icon: GraduationCap, value: String(GK_CATEGORY_TARGET_COUNT), label: "GK topic categories" },
    { icon: Clock, value: `${EXAM_SECONDS_PER_QUESTION}s`, label: "Per question in exam mode" },
  ];
  return (
    <section className="container-page py-20">
      <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card p-8">
            <s.icon className="h-6 w-6 text-violet" />
            <p className="mt-4 font-display text-4xl font-extrabold md:text-5xl">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="container-page">
      <div className="relative overflow-hidden rounded-3xl bg-hero px-6 py-14 text-navy-foreground md:px-14">
        <div className="pointer-events-none absolute inset-0 grid-pattern" aria-hidden />
        <div className="relative grid items-center gap-8 md:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Track every test. See yourself improve.</h2>
            <p className="mt-3 max-w-lg text-navy-foreground/75">
              Create a free account to save your results, follow subject-wise progress and pick up
              where you left off on any device.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button variant="hero" size="lg" asChild>
              <Link to="/login" search={{ tab: "signup" }}>
                <Target /> Create free account
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/dashboard">
                <LineChart /> View dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
