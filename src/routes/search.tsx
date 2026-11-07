import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { SearchBar } from "@/components/site/SearchBar";
import { McqBrowser } from "@/components/mcq/McqBrowser";
import { EXAM_CATEGORIES } from "@/lib/exam-categories";
import { SUBJECTS } from "@/lib/subjects";
import { cn } from "@/lib/utils";

type Search = { q?: string | undefined; exam?: string | undefined; subject?: string | undefined; page?: number | undefined };

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
    exam: typeof s["exam"] === "string" && s["exam"] ? s["exam"] : undefined,
    subject: typeof s["subject"] === "string" && s["subject"] ? s["subject"] : undefined,
    page: Number(s["page"]) > 1 ? Math.floor(Number(s["page"])) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Search MCQs — Ilmivora" },
      {
        name: "description",
        content: "Search thousands of MCQs by keyword, subject and exam category (PPSC, FPSC, NTS).",
      },
      { property: "og:title", content: "Search MCQs — Ilmivora" },
      { property: "og:description", content: "Find MCQs by keyword, subject or exam." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q, exam, subject, page = 1 } = Route.useSearch();
  const navigate = Route.useNavigate();
  const examLabel = EXAM_CATEGORIES.find((c) => c.code === exam)?.code;
  const matchingSubjects = q
    ? SUBJECTS.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title={q ? `Results for “${q}”` : examLabel ? `${examLabel} MCQs` : "Search MCQs"}
      >
        <SearchBar key={q} defaultValue={q} className="max-w-2xl" />
      </PageHeader>
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6">
          <FilterGroup title="Exam category">
            <FilterItem active={!exam} onClick={() => navigate({ search: (s) => ({ ...s, exam: undefined, page: undefined }), resetScroll: false })}>
              All exams
            </FilterItem>
            {EXAM_CATEGORIES.map((c) => (
              <FilterItem
                key={c.code}
                active={exam === c.code}
                onClick={() => navigate({ search: (s) => ({ ...s, exam: c.code, page: undefined }), resetScroll: false })}
              >
                {c.code === "Other" ? "Others" : c.code}
              </FilterItem>
            ))}
          </FilterGroup>
          <FilterGroup title="Subject">
            <select
              value={subject ?? ""}
              onChange={(e) =>
                navigate({ search: (s) => ({ ...s, subject: e.target.value || undefined, page: undefined }), resetScroll: false })
              }
              aria-label="Filter by subject"
              className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All subjects</option>
              {SUBJECTS.map((s) => (
                <option key={s.slug} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </FilterGroup>
        </aside>
        <div>
          {matchingSubjects.length > 0 && (
            <div className="mb-6">
              <p className="mb-2 text-sm font-semibold text-muted-foreground">Matching subjects</p>
              <div className="flex flex-wrap gap-2">
                {matchingSubjects.map((s) =>
                  s.slug === "general-knowledge" ? (
                    <Link key={s.slug} to="/general-knowledge" className="rounded-full bg-primary-soft px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-primary hover:text-primary-foreground">
                      {s.name}
                    </Link>
                  ) : (
                    <Link
                      key={s.slug}
                      to="/subjects/$slug"
                      params={{ slug: s.slug }}
                      className="rounded-full bg-primary-soft px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-primary hover:text-primary-foreground"
                    >
                      {s.name}
                    </Link>
                  ),
                )}
              </div>
            </div>
          )}
          <McqBrowser
            filters={{ examCategory: exam, subject }}
            search={q}
            page={page}
            showSearch={false}
            onPageChange={(p) => navigate({ search: (s) => ({ ...s, page: p > 1 ? p : undefined }), resetScroll: false })}
            emptyMessage="No MCQs match these filters yet."
          />
        </div>
      </div>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="flex flex-wrap gap-1.5 lg:flex-col">{children}</div>
    </div>
  );
}

function FilterItem({
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
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
