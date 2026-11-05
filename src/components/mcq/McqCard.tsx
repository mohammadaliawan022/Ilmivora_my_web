import { Check, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCorrectLetter, getOptions, type Mcq } from "@/lib/mcq";
import { cn } from "@/lib/utils";

export function McqCard({ mcq, index }: { mcq: Mcq; index?: number }) {
  const [revealed, setRevealed] = useState(false);
  const correct = getCorrectLetter(mcq);

  return (
    <article className="card-surface p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {index !== undefined && (
          <span className="font-display text-sm font-bold text-primary">Q{index}.</span>
        )}
        <Badge variant="soft">{mcq.subject}</Badge>
        {mcq.exam_category && <Badge variant="outline">{mcq.exam_category}</Badge>}
      </div>
      {mcq.submitter_name && (
        <p className="mt-2 text-xs text-muted-foreground">Submitted by {mcq.submitter_name}</p>
      )}
      <h3 className="mt-3 font-sans text-base font-semibold leading-relaxed tracking-normal text-foreground md:text-lg">
        {mcq.question}
      </h3>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {getOptions(mcq).map((o) => {
          const isCorrect = revealed && o.letter === correct;
          return (
            <li
              key={o.letter}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                isCorrect ? "border-success bg-success-soft text-foreground" : "border-border",
              )}
            >
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs font-bold",
                  isCorrect ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {isCorrect ? <Check className="h-3.5 w-3.5" /> : o.letter}
              </span>
              <span className="pt-0.5">{o.text}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => setRevealed((v) => !v)}>
          {revealed ? <EyeOff /> : <Eye />}
          {revealed ? "Hide answer" : "Show answer"}
        </Button>
      </div>
      {revealed && mcq.explanation && (
        <p className="mt-2 rounded-lg bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground animate-rise">
          <span className="font-semibold text-foreground">Explanation: </span>
          {mcq.explanation}
        </p>
      )}
    </article>
  );
}
