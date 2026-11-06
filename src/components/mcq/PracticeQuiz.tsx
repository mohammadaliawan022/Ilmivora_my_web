import { ArrowLeft, ArrowRight, CheckCircle2, Flag, Lightbulb, RotateCcw, XCircle } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { saveAttempt } from "@/lib/attempts";
import {
  PRACTICE_PAGE_SIZE,
  getCorrectLetter,
  getOptions,
  paginate,
  scoreExam,
  type Mcq,
  type OptionLetter,
} from "@/lib/mcq";
import { OptionButton, type OptionState } from "./OptionButton";
import { ScoreSummary } from "./ScoreSummary";

type Answers = Record<string, OptionLetter | undefined>;

export function PracticeQuiz({
  mcqs,
  label,
  onRestart,
}: {
  mcqs: Mcq[];
  label: string;
  onRestart: () => void;
}) {
  const pages = useMemo(() => paginate(mcqs, PRACTICE_PAGE_SIZE), [mcqs]);
  const [pageIndex, setPageIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());
  const topRef = useRef<HTMLDivElement>(null);

  const current = pages[Math.min(pageIndex, pages.length - 1)] ?? [];
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const score = useMemo(() => scoreExam(mcqs, answers), [mcqs, answers]);
  const isLastPage = pageIndex === pages.length - 1;
  const offset = pageIndex * PRACTICE_PAGE_SIZE;

  const goTo = (i: number) => {
    setPageIndex(i);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const finish = () => {
    saveAttempt({
      mode: "practice",
      subject: label,
      ...score,
      durationSec: Math.round((Date.now() - startedAt.current) / 1000),
    });
    setFinished(true);
  };

  if (finished) {
    return (
      <div className="space-y-6">
        <ScoreSummary score={score} title="Practice complete" />
        <div className="flex justify-center">
          <Button onClick={onRestart} size="lg">
            <RotateCcw /> Practice again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="mx-auto max-w-3xl scroll-mt-24">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-foreground">
          Page {pageIndex + 1} <span className="text-muted-foreground">of {pages.length}</span>
          <span className="ml-2 font-normal text-muted-foreground">
            · Questions {offset + 1}–{offset + current.length} of {mcqs.length}
          </span>
        </span>
        <span className="text-muted-foreground">
          {answeredCount} answered · <span className="text-success">{score.correct} correct</span>
        </span>
      </div>
      <Progress value={(answeredCount / mcqs.length) * 100} className="h-2" />

      <div key={pageIndex} className="mt-6 space-y-5">
        {current.map((m, i) => (
          <PracticeQuestion
            key={m.id}
            mcq={m}
            number={offset + i + 1}
            chosen={answers[m.id]}
            onChoose={(l) => setAnswers((a) => ({ ...a, [m.id]: l }))}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" disabled={pageIndex === 0} onClick={() => goTo(pageIndex - 1)}>
          <ArrowLeft /> Previous page
        </Button>
        {pages.length > 1 && (
          <div className="flex flex-wrap justify-center gap-1" aria-label="Pages">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-current={i === pageIndex ? "page" : undefined}
                aria-label={`Page ${i + 1}`}
                className={
                  "h-8 min-w-8 rounded-md px-2 text-sm font-semibold transition-colors " +
                  (i === pageIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground")
                }
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
        {isLastPage ? (
          <Button onClick={finish}>
            <Flag /> Finish practice
          </Button>
        ) : (
          <Button onClick={() => goTo(pageIndex + 1)}>
            Next page <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}

function PracticeQuestion({
  mcq,
  number,
  chosen,
  onChoose,
}: {
  mcq: Mcq;
  number: number;
  chosen: OptionLetter | undefined;
  onChoose: (l: OptionLetter) => void;
}) {
  const correct = getCorrectLetter(mcq);
  const stateFor = (letter: OptionLetter): OptionState => {
    if (!chosen) return "idle";
    if (letter === correct) return "correct";
    if (letter === chosen) return "wrong";
    return "dimmed";
  };

  return (
    <article className="card-surface p-5 animate-rise md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-sm font-bold text-primary">Q{number}.</span>
        <Badge variant="soft">{mcq.subject}</Badge>
        {mcq.exam_category && <Badge variant="outline">{mcq.exam_category}</Badge>}
      </div>
      <h2 className="mt-3 font-sans text-base font-semibold leading-relaxed tracking-normal md:text-lg">
        {mcq.question}
      </h2>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {getOptions(mcq).map((o) => (
          <OptionButton
            key={o.letter}
            letter={o.letter}
            text={o.text}
            state={stateFor(o.letter)}
            disabled={!!chosen}
            onClick={() => onChoose(o.letter)}
          />
        ))}
      </div>

      {chosen && (
        <div className="mt-4 space-y-3 animate-rise">
          {chosen === correct ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" /> Correct!
            </p>
          ) : (
            <p className="flex items-center gap-2 text-sm font-semibold text-danger">
              <XCircle className="h-4 w-4" /> Incorrect — the correct answer is {correct}.
            </p>
          )}
          {mcq.explanation && (
            <div className="flex gap-3 rounded-xl bg-muted p-4 text-sm leading-relaxed">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <p className="whitespace-pre-line text-muted-foreground">
                <span className="font-semibold text-foreground">Explanation: </span>
                {mcq.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
