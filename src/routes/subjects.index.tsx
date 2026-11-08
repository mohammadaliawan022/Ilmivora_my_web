import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { CategoryLink } from "@/components/site/CategoryLink";
import { subjectCountsQuery } from "@/lib/data/queries";
import { getSubjectCounts } from "@/lib/data/mcq-repo";
import { SUBJECT_GROUPS, SUBJECTS, type SubjectGroup } from "@/lib/subjects";
import { cn } from "@/lib/utils";

type Search = { group?: SubjectGroup | undefined };

export const Route = createFileRoute("/subjects/")({
  loader: async () => {
    try { return await getSubjectCounts(); } catch { return {}; }
  },
  validateSearch: (s: Record<string, unknown>): Search => ({
    group: SUBJECT_GROUPS.includes(s["group"] as SubjectGroup) ? (s["group"] as SubjectGroup) : undefined,
  }),
  head: ({ loaderData }) => ({
    meta: [
      { title: "All Subjects — Ilmivora MCQs" },
      {
        name: "description",
        content: `Browse ${Object.values(loaderData ?? {}).filter((count) => count > 0).length} subject banks with published MCQs and answers on Ilmivora.`,
      },
      { property: "og:title", content: "All Subjects — Ilmivora" },
      { property: "og:description", content: "Subject-wise MCQs for PPSC, FPSC and NTS preparation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://ilmivora-1.vercel.app/subjects" }],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const initialCounts = Route.useLoaderData();
  const { group } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [filter, setFilter] = useState("");
  const { data: counts = initialCounts } = useQuery(subjectCountsQuery());
  const availableCount = Object.values(counts).filter((count) => count > 0).length;

  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return SUBJECTS.filter((s) =>
      (counts[s.name] ?? 0) > 0 && (!group || s.group === group) && (!f || s.name.toLowerCase().includes(f)),
    );
  }, [counts, group, filter]);

  return (
    <>
      <PageHeader
        eyebrow="Subjects"
        title="All subjects"
        description={`${availableCount} subject banks with published questions. Coverage grows as new question sets are added.`}
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
            placeholder="Find a subject…"
            aria-label="Find a subject"
            className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring md:w-64"
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((s) => (
            <CategoryLink
              key={s.slug}
              cat={{ name: s.name, slug: s.slug }}
              className="card-surface card-interactive group flex items-center gap-4 p-4"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <s.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{s.name}</span>
                <span className="text-xs text-muted-foreground">
                  {s.group}
                  {counts && ` · ${(counts[s.name] ?? 0).toLocaleString()} MCQs`}
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </CategoryLink>
          ))}
        </div>
        {visible.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">Nothing matches “{filter}”.</p>
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
