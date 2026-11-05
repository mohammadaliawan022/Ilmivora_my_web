import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight } from "lucide-react";
import { SubjectQuizSidebar } from "@/components/mcq/SubjectQuizSidebar";
import { SubjectIntro } from "@/components/site/SubjectIntro";
import { McqBrowser } from "@/components/mcq/McqBrowser";
import { GK_CATEGORY_TARGET_COUNT, getGkCategories } from "@/lib/gk-categories";
import { GK_SUBJECT } from "@/lib/subjects";

type Search = { page?: number | undefined; q?: string | undefined };

export const Route = createFileRoute("/general-knowledge/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    page: Number(s["page"]) > 1 ? Math.floor(Number(s["page"])) : undefined,
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "General Knowledge MCQs by Topic — Ilmivora" },
      {
        name: "description",
        content:
          "Browse General Knowledge MCQs by topic category for PPSC, FPSC and NTS, each with answers and explanations.",
      },
      { property: "og:title", content: "General Knowledge MCQs — Ilmivora" },
      { property: "og:description", content: "GK MCQs organised by topic category." },
    ],
  }),
  component: GkPage,
});

function GkPage() {
  const { page = 1, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const categories = getGkCategories();

  return (
    <>
      <section className="relative overflow-hidden bg-hero text-navy-foreground">
        <div className="pointer-events-none absolute inset-0 grid-pattern" aria-hidden />
        <div className="container-page relative py-12 text-center md:py-16">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet/70 bg-violet/25 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            <BookOpen className="h-4 w-4" aria-hidden="true" /> MCQ Practice
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight md:text-5xl">
            General Knowledge <span className="bg-gradient-to-r from-blue-400 via-violet to-purple-500 bg-clip-text text-transparent">MCQs</span>
          </h1>
          <p className="mt-3 text-sm text-navy-foreground/75 md:text-base">Learn Smarter. Achieve More.</p>
        </div>
      </section>

      <div className="container-page py-8 md:py-10">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/subjects" className="font-semibold text-primary hover:underline">All Subjects &amp; Topics</Link>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span className="text-foreground">General Knowledge</span>
        </nav>
        <SubjectIntro slug="general-knowledge" name={GK_SUBJECT} />

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-xl bg-primary-soft px-4 py-3 font-semibold text-primary">All MCQs</span>
          <span className="text-muted-foreground">All General Knowledge questions</span>
        </div>

        {categories.length > 0 && (
          <details className="card-surface mt-5 rounded-2xl p-4">
            <summary className="cursor-pointer list-none font-semibold text-primary marker:hidden">
              <span aria-hidden="true" className="mr-2">›</span> Explore {categories.length} topics in General Knowledge
            </summary>
            <div className="mt-4 grid gap-2 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  to="/general-knowledge/$topic"
                  params={{ topic: c.slug }}
                  className="rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-primary"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </details>
        )}
        {categories.length === 0 && (
          <p className="card-surface mt-5 p-5 text-sm text-muted-foreground">
            The {GK_CATEGORY_TARGET_COUNT} General Knowledge topics will appear here once they are available.
          </p>
        )}

        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0" aria-labelledby="gk-questions-heading">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h2 id="gk-questions-heading" className="text-xl font-bold md:text-2xl">General Knowledge Questions</h2>
            </div>
            <McqBrowser
              filters={{ subject: GK_SUBJECT }}
              page={page}
              search={q}
              onPageChange={(p) => navigate({ search: (s) => ({ ...s, page: p > 1 ? p : undefined }) })}
              onSearchChange={(v) => navigate({ search: { q: v } })}
              emptyMessage="No General Knowledge MCQs have been added yet."
            />
          </section>
          <SubjectQuizSidebar filters={{ subject: GK_SUBJECT }} subject={GK_SUBJECT} page={page} />
        </div>
      </div>
    </>
  );
}
