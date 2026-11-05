import type { ExamScore } from "@/lib/mcq";
import { cn } from "@/lib/utils";

export function ScoreSummary({ score, title }: { score: ExamScore; title: string }) {
  const hasNegativeMarking = score.penaltyPerIncorrect > 0;
  const netMarks = Number.isInteger(score.netMarks) ? score.netMarks : score.netMarks.toFixed(2);
  const tone =
    score.percentage >= 70 ? "text-success" : score.percentage >= 40 ? "text-warning" : "text-danger";
  const message =
    score.percentage >= 70
      ? "Excellent work — you're exam ready on this set."
      : score.percentage >= 40
        ? "Good effort. Review the explanations and try again."
        : "Keep practising — every attempt builds your foundation.";

  return (
    <section className="card-surface overflow-hidden">
      <div className="relative bg-hero px-6 py-10 text-center text-navy-foreground">
        <div className="pointer-events-none absolute inset-0 grid-pattern" aria-hidden />
        <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-navy-foreground/60">
          {title}
        </p>
        <p className="relative mt-2 font-display text-6xl font-bold md:text-7xl">{score.percentage}%</p>
        <p className="relative mt-2 text-sm text-navy-foreground/75">{message}</p>
      </div>
      <dl className="grid grid-cols-2 divide-x divide-y divide-border md:grid-cols-4 md:divide-y-0">
        <Stat label="Total questions" value={score.total} />
        <Stat label="Correct" value={score.correct} className="text-success" />
        <Stat label="Incorrect" value={score.incorrect} className="text-danger" />
        {hasNegativeMarking ? (
          <Stat label="Net marks" value={`${netMarks} / ${score.total}`} className={tone} />
        ) : (
          <Stat label="Percentage" value={`${score.percentage}%`} className={tone} />
        )}
      </dl>
      {hasNegativeMarking && (
        <p className="border-t border-border px-6 py-3 text-center text-xs text-muted-foreground">
          {score.correct} mark{score.correct === 1 ? "" : "s"} earned − {score.negativeMarks} deducted
          for incorrect answers ({score.penaltyPerIncorrect} each).
        </p>
      )}
      {score.unanswered > 0 && (
        <p className="border-t border-border px-6 py-3 text-center text-xs text-muted-foreground">
          {score.unanswered} question{score.unanswered === 1 ? "" : "s"} left unanswered.
        </p>
      )}
    </section>
  );
}

function Stat({ label, value, className }: { label: string; value: number | string; className?: string }) {
  return (
    <div className="px-4 py-5 text-center">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={cn("mt-1 font-display text-3xl font-bold", className)}>{value}</dd>
    </div>
  );
}
