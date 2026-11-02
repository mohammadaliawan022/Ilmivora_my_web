import { ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, RotateCcw, SkipForward, XCircle } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { saveAttempt } from "@/lib/attempts";
import { getCorrectLetter, getOptions, scoreExam, type Mcq, type OptionLetter } from "@/lib/mcq";
import { OptionButton, type OptionState } from "./OptionButton";
import { ScoreSummary } from "./ScoreSummary";

export function PracticeQuiz({
  mcqs,
  label,
  topic,
  onRestart,
}: {
  mcqs: Mcq[];
  label: string;
  topic?: string | null;
  onRestart: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OptionLetter | undefined>>({});
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());

  const mcq = mcqs[index];
  const chosen = answers[mcq?.id];
  const correct = mcq ? getCorrectLetter(mcq) : null;
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const score = useMemo(() => scoreExam(mcqs, answers), [mcqs, answers]);

  const finish = () => {
    saveAttempt({
      mode: "practice",
      subject: label,
      topic,
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

  const stateFor = (letter: OptionLetter): OptionState => {
    if (!chosen) return "idle";
    if (letter === correct) return "correct";
    if (letter === chosen) return "wrong";
    return "dimmed";
  };

  const isLast = index === mcqs.length - 1;
  const next = () => (isLast ? finish() : setIndex((i) => i + 1));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between gap-4 text-sm">
        <span className="font-semibold text-foreground">
          Question {index + 1} <span className="text-muted-foreground">of {mcqs.length}</span>
        </span>
        <span className="text-muted-foreground">
          {answeredCount} answered · <span className="text-success">{score.correct} correct</span>
        </span>
      </div>
      <Progress value={((index + 1) / mcqs.length) * 100} className="h-2" />

      <article key={mcq.id} className="card-surface mt-6 p-5 animate-rise md:p-8">
        <div className="flex flex-wrap gap-2">
          <Badge variant="soft">{mcq.subject}</Badge>
          {mcq.topic && <Badge variant="violet">{mcq.topic}</Badge>}
          {mcq.exam_category && <Badge variant="outline">{mcq.exam_category}</Badge>}
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
              state={stateFor(o.letter)}
              disabled={!!chosen}
              onClick={() => setAnswers((a) => ({ ...a, [mcq.id]: o.letter }))}
            />
          ))}
        </div>

        {chosen && (
          <div className="mt-6 space-y-3 animate-rise">
            {chosen === correct ? (
              <p className="flex items-center gap-2 font-semibold text-success">
                <CheckCircle2 className="h-5 w-5" /> Correct!
              </p>
            ) : (
              <p className="flex items-center gap-2 font-semibold text-danger">
                <XCircle className="h-5 w-5" /> Incorrect — the correct answer is {correct}.
              </p>
            )}
            {mcq.explanation && (
              <div className="flex gap-3 rounded-xl bg-muted p-4 text-sm leading-relaxed">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">Explanation: </span>
                  {mcq.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </article>

      <div className="mt-6 flex items-center justify-between gap-2">
        <Button variant="outline" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          <ArrowLeft /> Previous
        </Button>
        <div className="flex gap-2">
          {!chosen && (
            <Button variant="ghost" onClick={next}>
              Skip <SkipForward />
            </Button>
          )}
          <Button onClick={next} disabled={!chosen && !isLast}>
            {isLast ? "Finish" : "Next"} <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
