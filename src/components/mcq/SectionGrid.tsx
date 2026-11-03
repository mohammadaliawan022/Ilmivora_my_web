import { ChevronRight, FolderOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryLink } from "@/components/site/CategoryLink";
import { getChildren, getDescendants, type Category } from "@/lib/categories";

/** Grid of a subject's sub-sections, with a quick filter for long lists. */
export function SectionGrid({ sections, title = "Sections" }: { sections: Category[]; title?: string }) {
  const [filter, setFilter] = useState("");
  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return f ? sections.filter((s) => s.name.toLowerCase().includes(f)) : sections;
  }, [sections, filter]);

  if (sections.length === 0) return null;

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl font-bold">
          {title} <span className="text-base font-medium text-muted-foreground">({sections.length})</span>
        </h2>
        {sections.length > 12 && (
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter sections…"
            aria-label="Filter sections"
            className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-64"
          />
        )}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((c) => {
          const nested = getChildren(c.name).length;
          return (
            <CategoryLink
              key={c.slug}
              cat={c}
              className="card-surface card-interactive group flex items-center gap-3 px-4 py-3.5"
            >
              {nested > 0 && <FolderOpen className="h-4 w-4 shrink-0 text-violet" />}
              <span className="min-w-0 flex-1">
                <span className="block font-medium leading-snug">{c.name}</span>
                {nested > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {getDescendants(c.name).length} sub-sections
                  </span>
                )}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </CategoryLink>
          );
        })}
      </div>
      {visible.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">No sections match “{filter}”.</p>
      )}
    </section>
  );
}
