import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { subjectCountsQuery } from "@/lib/data/queries";
import { SUBJECT_GROUPS, SUBJECTS, type SubjectGroup } from "@/lib/subjects";
import { cn } from "@/lib/utils";

type Search = { group?: SubjectGroup | undefined };

export const Route = createFileRoute("/subjects/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    group: SUBJECT_GROUPS.includes(s["group"] as SubjectGroup) ? (s["group"] as SubjectGroup) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "All Subjects — Ilmivora MCQs" },
      {
        name: "description",
        content:
          "Browse MCQs across 36 subjects: Pakistan Studies, Islamic Studies, English, Computer Science, Everyday Science, Law, Engineering and more.",
      },
      { property: "og:title", content: "All 36 Subjects — Ilmivora" },
      { property: "og:description", content: "Subject-wise MCQs for PPSC, FPSC and NTS preparation." },
    ],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const { group } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [filter, setFilter] = useState("");
  const { data: counts } = useQuery(subjectCountsQuery());

  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return SUBJECTS.filter((s) => (!group || s.group === group) && (!f || s.name.toLowerCase().includes(f)));
  }, [group, filter]);

  return (
    <>
      <PageHeader
        eyebrow="Subjects"
        title="All subjects"
        description={`${SUBJECTS.length} subjects for PPSC, FPSC, NTS and other competitive exams.`}
      />
      <div className="container-page py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Chip active={!group} onClick={() => navigate({ search: {} })}>
              All
            </Chip>
            {SUBJECT_GROUPS.map((g) => (
              <Chip key={g} active={group === g} onClick={() => navigate({ search: { group: g } })}>
                {g}
              </Chip>
            ))}
          </div>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter subjects…"
            aria-label="Filter subjects"
            className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring md:w-64"
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((s) => (
            <Link
              key={s.slug}
              to={s.slug === "general-knowledge" ? "/general-knowledge" : "/subjects/$slug"}
              params={{ slug: s.slug }}
              className="card-surface card-interactive group flex items-center gap-4 p-4"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <s.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{s.name}</span>
                <span className="text-xs text-muted-foreground">
                  {counts ? `${(counts[s.name] ?? 0).toLocaleString()} MCQs` : s.group}
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
        {visible.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">No subjects match “{filter}”.</p>
        )}
      </div>
    </>
  );
}

function Chip({
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
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
