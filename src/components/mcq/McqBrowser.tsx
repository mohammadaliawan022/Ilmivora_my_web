import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Inbox, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pager } from "@/components/site/Pager";
import { mcqListQuery } from "@/lib/data/queries";
import type { McqFilters } from "@/lib/data/mcq-repo";
import { McqCard } from "./McqCard";

/** Paginated, searchable MCQ list. Page and search live in the URL via props. */
export function McqBrowser({
  filters,
  page,
  search,
  onPageChange,
  onSearchChange,
  emptyMessage = "No MCQs found here yet.",
  showSearch = true,
}: {
  filters: McqFilters;
  page: number;
  search?: string | undefined;
  onPageChange: (page: number) => void;
  onSearchChange?: (q: string | undefined) => void;
  emptyMessage?: string;
  showSearch?: boolean;
}) {
  const [draft, setDraft] = useState(search ?? "");
  const questionListRef = useRef<HTMLDivElement>(null);
  const previousPage = useRef(page);
  useEffect(() => setDraft(search ?? ""), [search]);

  const query = useQuery(mcqListQuery({ ...filters, search }, page));

  useEffect(() => {
    if (previousPage.current === page || query.isPlaceholderData || query.data?.page !== page) return;
    previousPage.current = page;
    questionListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page, query.data?.page, query.isPlaceholderData]);

  return (
    <div className="space-y-5">
      {showSearch && onSearchChange && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchChange(draft.trim() || undefined);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Search within these MCQs…"
              aria-label="Search within these MCQs"
              className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      )}

      {query.isPending ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      ) : query.isError ? (
        <div className="card-surface flex flex-col items-center gap-3 p-10 text-center">
          <AlertTriangle className="h-8 w-8 text-danger" />
          <p className="font-semibold">We couldn't load these MCQs.</p>
          <Button variant="outline" onClick={() => query.refetch()}>
            Try again
          </Button>
        </div>
      ) : query.data.items.length === 0 ? (
        <div className="card-surface flex flex-col items-center gap-3 p-10 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground" />
          <p className="font-semibold">{search ? `No results for “${search}”.` : emptyMessage}</p>
        </div>
      ) : (
        <>
          <div
            ref={questionListRef}
            className={`scroll-mt-24 space-y-4${query.isPlaceholderData ? " opacity-60" : ""}`}
          >
            {query.data.items.map((m, i) => (
              <McqCard
                key={m.id}
                mcq={m}
                index={(query.data.page - 1) * query.data.pageSize + i + 1}
              />
            ))}
          </div>
          <Pager
            page={query.data.page}
            pageCount={query.data.pageCount}
            total={query.data.total}
            onChange={onPageChange}
          />
        </>
      )}
    </div>
  );
}
