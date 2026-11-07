import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronRight, FileText, GraduationCap, Search } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { McqBrowser } from "@/components/mcq/McqBrowser";
import { Button } from "@/components/ui/button";
import { examCountsQuery, mcqListQuery } from "@/lib/data/queries";
import { EXAM_CATEGORIES } from "@/lib/exam-categories";
import { cn } from "@/lib/utils";

type SearchParams = { exam?: string | undefined; q?: string | undefined; page?: number | undefined };

export const Route = createFileRoute("/past-papers")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    exam: typeof search["exam"] === "string" && EXAM_CATEGORIES.some((category) => category.code === search["exam"])
      ? search["exam"] as string
      : undefined,
    q: typeof search["q"] === "string" && search["q"] ? search["q"] : undefined,
    page: Number(search["page"]) > 1 ? Math.floor(Number(search["page"])) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Past Papers — Ilmivora" },
      { name: "description", content: "Browse past paper MCQs by competitive exam and practise with Ilmivora." },
    ],
  }),
  component: PastPapersPage,
});

function PastPapersPage() {
  const { exam, q, page = 1 } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [searchDraft, setSearchDraft] = useState(q ?? "");
  const filters = { examCategory: exam, search: q };
  const results = useQuery(mcqListQuery(filters, page));
  const categoryCounts = useQuery(examCountsQuery()).data ?? {};

  useEffect(() => setSearchDraft(q ?? ""), [q]);

  const selectExam = (nextExam?: string) =>
    navigate({
      search: (current) => ({ ...current, exam: nextExam, page: undefined }),
      resetScroll: false,
    });

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate({
      search: (current) => ({ ...current, q: searchDraft.trim() || undefined, page: undefined }),
      resetScroll: false,
    });
  };

  const examLabel = (code: string) => EXAM_CATEGORIES.find((category) => category.code === code)?.name ?? code;

  return (
    <>
      <section className="relative overflow-hidden bg-hero text-navy-foreground">
        <div className="pointer-events-none absolute inset-0 grid-pattern" aria-hidden />
        <div className="container-page relative py-14 text-center md:py-20">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet/70 bg-violet/25 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Competitive exam preparation
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight md:text-6xl">
            Explore <span className="bg-gradient-to-r from-blue-400 via-violet to-purple-500 bg-clip-text text-transparent">Past Papers</span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-navy-foreground/75 md:text-lg">
            Prepare for competitive exams with organized, exam-wise past paper questions.
          </p>
        </div>
      </section>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-10">
        <div className="min-w-0 space-y-6">
          <form onSubmit={submitSearch} role="search" className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 shadow-card">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search past paper questions…"
              aria-label="Search past paper questions"
              className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground md:text-base"
            />
            <Button type="submit" size="icon" variant="ghost" aria-label="Search questions">
              <Search />
            </Button>
          </form>

          <div className="flex flex-wrap gap-2.5" aria-label="Filter past papers by exam">
            <ExamPill active={!exam} onClick={() => selectExam()}>
              All Papers
            </ExamPill>
            {EXAM_CATEGORIES.map((category) => (
              <ExamPill key={category.code} active={exam === category.code} onClick={() => selectExam(category.code)}>
                {category.code}
              </ExamPill>
            ))}
          </div>

          <section aria-labelledby="paper-questions-title">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h2 id="paper-questions-title" className="text-2xl font-bold">Past Paper Questions</h2>
              <span className="text-sm text-muted-foreground">
                {results.data ? `${results.data.total.toLocaleString()} questions` : "Loading questions…"}
              </span>
            </div>
            <McqBrowser
              filters={filters}
              search={q}
              page={page}
              showSearch={false}
              onPageChange={(nextPage) => navigate({
                search: (current) => ({ ...current, page: nextPage > 1 ? nextPage : undefined }),
                resetScroll: false,
              })}
              emptyMessage="No past papers available yet. Questions will appear here once they have an exam category."
            />
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="card-surface p-5" aria-labelledby="exam-categories-title">
            <h2 id="exam-categories-title" className="text-lg font-bold">Exam Categories</h2>
            <nav className="mt-4 space-y-1" aria-label="Past paper exam categories">
              <SidebarCategory active={!exam} count={results.data?.total} onClick={() => selectExam()}>
                All Papers
              </SidebarCategory>
              {EXAM_CATEGORIES.map((category) => (
                <SidebarCategory
                  key={category.code}
                  active={exam === category.code}
                  count={categoryCounts[category.code] ?? 0}
                  onClick={() => selectExam(category.code)}
                  title={examLabel(category.code)}
                >
                  {category.code}
                </SidebarCategory>
              ))}
            </nav>
          </section>

          <section className="rounded-2xl bg-gradient-to-br from-violet to-purple-700 p-6 text-white shadow-card">
            <GraduationCap className="h-7 w-7" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold">Practice more MCQs</h2>
            <p className="mt-2 text-sm text-white/80">Explore subject-wise questions with Practice and Exam modes.</p>
            <Button asChild variant="secondary" className="mt-5 w-full">
              <Link to="/practice">
                <BookOpen /> Start practicing <ChevronRight />
              </Link>
            </Button>
          </section>
        </aside>
      </div>
    </>
  );
}

function ExamPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

function SidebarCategory({
  active,
  count,
  onClick,
  title,
  children,
}: {
  active: boolean;
  count: number | undefined;
  onClick: () => void;
  title?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-3.5 py-3 text-left text-sm transition-colors",
        active ? "bg-primary-soft font-semibold text-primary" : "text-foreground hover:bg-accent",
      )}
    >
      <span>{children}</span>
      <span className="flex items-center gap-2 text-muted-foreground">
        {count !== undefined && <span className="text-xs">{count.toLocaleString()}</span>}
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </button>
  );
}
