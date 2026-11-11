import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookMarked,
  Clock,
  Layers,
  LineChart,
  Sparkles,
  Target,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchBar } from "@/components/site/SearchBar";
import { OptionButton } from "@/components/mcq/OptionButton";
import { recentMcqsQuery } from "@/shared/data/queries";
import { getExamCategoryCounts, getQuizQuestions, getSubjectCounts } from "@/shared/data/mcq-repo";
import { EXAM_CATEGORIES } from "@/shared/exam-categories";
import { EXAM_SECONDS_PER_QUESTION, getCorrectLetter, getOptions, type Mcq, type OptionLetter } from "@/shared/mcq";
import { GK_DOMAIN, POPULAR_SUBJECT_SLUGS, SUBJECT_GROUPS, SUBJECTS, getSubjectBySlug } from "@/shared/subjects";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [subjects, exams, candidates] = await Promise.all([
      getSubjectCounts().catch(() => ({})),
      getExamCategoryCounts().catch(() => ({})),
      getQuizQuestions({}, 20).catch(() => []),
    ]);
    const featuredMcqs = candidates
      .filter((mcq) => getCorrectLetter(mcq) !== null && getOptions(mcq).every((option) => option.text.trim()))
      .slice(0, 4);
    return { subjects, exams, featuredMcqs };
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
  const { subjects, exams, featuredMcqs } = Route.useLoaderData();
  return (
    <>
      <Hero featuredMcqs={featuredMcqs} />
      <PopularSubjects counts={subjects} />
      <ExamCategories counts={exams} />
      <FeaturedGroups counts={subjects} />
      <RecentMcqs />
      <Stats counts={subjects} />
      <Cta />
    </>
  );
}

function Hero({ featuredMcqs }: { featuredMcqs: Mcq[] }) {
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
            Subject-wise MCQs with answers and explanations, instant-feedback practice and a timed exam
            mode to help you build recall and learn from mistakes.
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
        <HeroQuestion questions={featuredMcqs} />
      </div>
    </section>
  );
}

function HeroQuestion({ questions }: { questions: Mcq[] }) {
  const [mcq, setMcq] = useState<Mcq | null>(null);
  const [answers, setAnswers] = useState<Record<string, OptionLetter>>({});
  const initialized = useRef(false);
  const chosen = mcq ? answers[mcq.id] ?? null : null;
  const correct = mcq ? getCorrectLetter(mcq) : null;
  const options = mcq ? getOptions(mcq) : [];

  useEffect(() => {
    if (initialized.current || !questions.length) return;
    initialized.current = true;

    const storageKey = "ilmivora-home-featured-mcqs";
    let pool = questions.slice(0, 4);
    let index = pool.length > 1 ? 1 : 0;

    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "null") as {
        questions?: Mcq[];
        nextIndex?: number;
      } | null;
      if (
        saved?.questions?.length === 4 &&
        saved.questions.every((item) => item?.id && item?.question && getOptions(item).every((option) => option.text.trim())) &&
        Number.isInteger(saved.nextIndex)
      ) {
        pool = saved.questions;
        index = (saved.nextIndex! + pool.length) % pool.length;
      }
      setMcq(pool[index] ?? pool[0] ?? null);
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ questions: pool, nextIndex: (index + 1) % pool.length }),
      );
    } catch {
      setMcq(pool[index] ?? pool[0] ?? null);
    }
  }, [questions]);

  return (
    <div className="relative mx-auto w-full max-w-md lg:animate-float-slow">
      <div className="absolute -inset-4 rounded-[2rem] bg-brand opacity-30 blur-2xl" aria-hidden />
      <div className="card-surface relative p-6 text-card-foreground">
        <div className="flex items-center justify-between">
          {mcq ? <Badge variant="soft">{mcq.subject}</Badge> : <Badge variant="soft">MCQ practice</Badge>}
          <span className="text-xs font-semibold text-muted-foreground">
            {mcq ? "Featured question" : "Try one"}
          </span>
        </div>
        {mcq ? (
          <>
            <p className="mt-4 text-lg font-semibold leading-snug">{mcq.question}</p>
            <div className="mt-4 grid gap-2.5">
              {options.map(({ letter, text }) => (
                <OptionButton
                  key={letter}
                  letter={letter}
                  text={text}
                  disabled={!!chosen}
                  state={!chosen ? "idle" : letter === correct ? "correct" : letter === chosen ? "wrong" : "dimmed"}
                  onClick={() => setAnswers((previous) => ({ ...previous, [mcq.id]: letter }))}
                />
              ))}
            </div>
            <p className="mt-4 min-h-10 text-sm text-muted-foreground">
              {chosen
                ? `${chosen === correct ? "Correct! " : `Not quite. The correct answer is ${correct}. `}${mcq.explanation?.trim() || "Review this question and keep practising."}`
                : "Pick an answer to see instant feedback."}
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">New practice questions will appear here soon.</p>
        )}
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

function PopularSubjects({ counts }: { counts: Record<string, number> }) {
  const popular = POPULAR_SUBJECT_SLUGS.flatMap((slug) => {
    const subject = getSubjectBySlug(slug);
    return subject && (counts[subject.name] ?? 0) > 0 ? [subject] : [];
  });
  if (!popular.length) return null;
  return (
    <section className="container-page py-20">
      <SectionHead
        eyebrow="Popular subjects"
        title="Where most aspirants begin"
        action={{ to: "/subjects", label: `Browse ${Object.values(counts).filter((n) => n > 0).length} available subjects` }}
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

function ExamCategories({ counts }: { counts: Record<string, number> }) {
  const available = EXAM_CATEGORIES.filter((category) => category.code !== "Other" && (counts[category.code] ?? 0) > 0);
  return (
    <section className="bg-secondary/60 py-20">
      <div className="container-page">
        {available.length ? (
          <>
            <SectionHead eyebrow="Browse by exam" title="Prepare for your commission" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {available.map((c, i) => (
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
          </>
        ) : (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">Study by subject</p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">Build a strong foundation first</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                The current question bank is organised by subject. Exam-specific question sets will appear when verified exam labels are available.
              </p>
            </div>
            <Button variant="outline" asChild><Link to="/study-guides">Read the preparation guide <ArrowRight /></Link></Button>
          </div>
        )}
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
    { icon: BookMarked, value: totalQuestions.toLocaleString(), label: "Published MCQs" },
    { icon: Layers, value: String(availableSubjects), label: "Subjects with questions" },
    { icon: Clock, value: `${EXAM_SECONDS_PER_QUESTION}s`, label: "Per question in exam mode" },
  ];
  return (
    <section className="container-page py-20">
      <div className="grid gap-px overflow-hidden rounded-3xl border border-border md:grid-cols-3">
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
              Review your test results and subject-wise performance. Results are currently saved in
              this browser, so they stay on this device.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button variant="hero" size="lg" asChild>
              <Link to="/practice">
                <Target /> Start practising
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/dashboard">
                <LineChart /> View your progress
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
