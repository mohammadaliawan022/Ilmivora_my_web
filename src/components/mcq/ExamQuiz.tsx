import { ArrowLeft, ArrowRight, Clock, Flag, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { saveAttempt } from "@/lib/attempts";
import {
  EXAM_SECONDS_PER_QUESTION,
  getOptions,
  scoreExam,
  type Mcq,
  type OptionLetter,
} from "@/lib/mcq";
import { cn } from "@/lib/utils";
import { ExamReview } from "./ExamReview";
import { OptionButton } from "./OptionButton";
import { ScoreSummary } from "./ScoreSummary";

export function ExamQuiz({
  mcqs,
  label,
  topic,
  onRestart,
}: {
  mcqs: Mcq[];
  label: string;
  topic?: string | null | undefined;
  onRestart: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OptionLetter | undefined>>({});
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>(() =>
    Object.fromEntries(mcqs.map((m) => [m.id, EXAM_SECONDS_PER_QUESTION])),
  );
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());

  const mcq = mcqs[Math.min(index, mcqs.length - 1)]!;
  const remaining = timeLeft[mcq.id] ?? 0;
  const expired = remaining <= 0;
  const score = useMemo(() => scoreExam(mcqs, answers), [mcqs, answers]);

  // Tick the current question's own 30-second clock.
  useEffect(() => {
    if (finished || expired) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => ({ ...t, [mcq.id]: Math.max(0, (t[mcq.id] ?? 0) - 1) }));
    }, 1000);
    return () => window.clearInterval(id);
  }, [mcq.id, expired, finished]);

  // When time runs out, move on to the next question that still has time.
  useEffect(() => {
    if (finished || !expired) return;
    const nextOpen = mcqs.findIndex((m, i) => i > index && (timeLeft[m.id] ?? 0) > 0);
    const anyOpen = mcqs.some((m) => (timeLeft[m.id] ?? 0) > 0);
    const t = window.setTimeout(() => {
      if (nextOpen !== -1) setIndex(nextOpen);
      else if (!anyOpen) submit();
    }, 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired, finished, index]);

  const submit = () => {
    if (finished) return;
    saveAttempt({
      mode: "exam",
      subject: label,
      topic,
      ...score,
      durationSec: Math.round((Date.now() - startedAt.current) / 1000),
    });
    setFinished(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (finished) {
    return (
      <div className="space-y-8">
        <ScoreSummary score={score} title="Exam result" />
        <div className="flex justify-center">
          <Button onClick={onRestart} size="lg">
            <RotateCcw /> Take another exam
          </Button>
        </div>
        <ExamReview mcqs={mcqs} answers={answers} />
      </div>
    );
  }

  const pct = (remaining / EXAM_SECONDS_PER_QUESTION) * 100;
  const answeredCount = Object.values(answers).filter(Boolean).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold">
            Question {index + 1} <span className="text-muted-foreground">of {mcqs.length}</span>
          </span>
          <div
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 font-display text-sm font-bold tabular-nums",
              remaining <= 5 ? "bg-danger-soft text-danger" : remaining <= 10 ? "bg-warning-soft text-warning" : "bg-primary-soft text-primary",
            )}
            role="timer"
            aria-live="polite"
          >
            <Clock className="h-4 w-4" />
            {expired ? "Time up" : `0:${String(remaining).padStart(2, "0")}`}
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-1000 ease-linear",
              remaining <= 5 ? "bg-danger" : remaining <= 10 ? "bg-warning" : "bg-primary",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>

        <article key={mcq.id} className="card-surface mt-6 p-5 animate-rise md:p-8">
          <div className="flex flex-wrap gap-2">
            <Badge variant="soft">{mcq.subject}</Badge>
            {mcq.exam_category && <Badge variant="outline">{mcq.exam_category}</Badge>}
            {expired && <Badge variant="danger">Locked</Badge>}
          </div>
          <h2 className="mt-4 font-sans text-lg font-semibold leading-relaxed tracking-normal md:text-xl">
            {mcq.question}
          </h2>
          <div className="mt-6 grid gap-3">
            {getOptions(mcq).map((o) => (
              <OptionButton
                key={o.letter}
                letter={o.letter}
                text={o.text}
                state={answers[mcq.id] === o.letter ? "selected" : expired ? "dimmed" : "idle"}
                disabled={expired}
                onClick={() => setAnswers((a) => ({ ...a, [mcq.id]: o.letter }))}
              />
            ))}
          </div>
        </article>

        <div className="mt-6 flex items-center justify-between gap-2">
          <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
            <ArrowLeft /> Previous
          </Button>
          {index < mcqs.length - 1 ? (
            <Button onClick={() => setIndex((i) => i + 1)}>
              Next <ArrowRight />
            </Button>
          ) : (
            <SubmitButton answered={answeredCount} total={mcqs.length} onConfirm={submit} />
          )}
        </div>
      </div>

      <aside className="card-surface h-fit p-5 lg:sticky lg:top-24">
        <h3 className="text-sm font-semibold">Question navigator</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {answeredCount} of {mcqs.length} answered
        </p>
        <div className="mt-4 grid grid-cols-6 gap-2 lg:grid-cols-5">
          {mcqs.map((m, i) => {
            const isCurrent = i === index;
            const isAnswered = !!answers[m.id];
            const isExpired = (timeLeft[m.id] ?? 0) <= 0;
            return (
              <button
                key={m.id}
                onClick={() => setIndex(i)}
                aria-label={`Go to question ${i + 1}`}
                aria-current={isCurrent}
                className={cn(
                  "grid aspect-square place-items-center rounded-lg border text-xs font-bold transition-all",
                  isCurrent && "ring-2 ring-ring ring-offset-2 ring-offset-card",
                  isAnswered
                    ? "border-primary bg-primary text-primary-foreground"
                    : isExpired
                      ? "border-border bg-muted text-muted-foreground line-through"
                      : "border-border bg-card hover:border-primary",
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="mt-5 space-y-1.5 text-xs text-muted-foreground">
          <Legend className="bg-primary" label="Answered" />
          <Legend className="border border-border bg-card" label="Not answered" />
          <Legend className="bg-muted" label="Time expired" />
        </div>
        <div className="mt-5">
          <SubmitButton answered={answeredCount} total={mcqs.length} onConfirm={submit} full />
        </div>
      </aside>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-3 w-3 rounded", className)} /> {label}
    </div>
  );
}

function SubmitButton({
  answered,
  total,
  onConfirm,
  full,
}: {
  answered: number;
  total: number;
  onConfirm: () => void;
  full?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={full ? "outline" : "violet"} className={full ? "w-full" : undefined}>
          <Flag /> Submit exam
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit your exam?</AlertDialogTitle>
          <AlertDialogDescription>
            You have answered {answered} of {total} questions. You won't be able to change answers
            after submitting.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep going</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Submit</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
