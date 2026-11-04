import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { mcqListQuery } from "@/lib/data/queries";
import type { McqFilters } from "@/lib/data/mcq-repo";

export function SubjectQuizSidebar({
  filters,
  subject,
  topic,
  page = 1,
}: {
  filters: McqFilters;
  subject: string;
  topic?: string | undefined;
  page?: number;
}) {
  const { data } = useQuery(mcqListQuery(filters, page));
  const search = topic ? { subject, topic } : { subject };
  const total = data?.total ?? 0;

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <section className="card-surface space-y-4 p-5" aria-labelledby="quiz-sidebar-title">
        <div>
          <h2 id="quiz-sidebar-title" className="text-lg font-bold">Test your knowledge</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {data ? `${total.toLocaleString()} questions available.` : "Loading questions…"} Choose a quiz mode.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-3.5 py-3 text-sm font-medium">
          Current page ({data?.items.length ?? 0} questions)
          <p className="mt-1 text-xs font-normal text-muted-foreground">Questions are shown 10 at a time.</p>
        </div>
        <Link
          to="/practice"
          search={search}
          className="block rounded-2xl border border-primary/40 bg-primary-soft/50 p-4 transition-colors hover:bg-primary-soft"
        >
          <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="mt-3 font-bold">Practice mode</h3>
          <p className="mt-1 text-sm text-muted-foreground">No timer. Get instant feedback.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Start practice <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
        <Link
          to="/exam"
          search={search}
          className="block rounded-2xl border border-violet/40 bg-violet/10 p-4 transition-colors hover:bg-violet/15"
        >
          <Clock className="h-5 w-5 text-violet" aria-hidden="true" />
          <h3 className="mt-3 font-bold">Exam mode</h3>
          <p className="mt-1 text-sm text-muted-foreground">Timed questions. Review your score at the end.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet">
            Start exam <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <GraduationCap className="mt-0.5 h-4 w-4 shrink-0" />
          Page {page} · Questions are loaded in pages as you practise.
        </p>
      </section>
    </aside>
  );
}
