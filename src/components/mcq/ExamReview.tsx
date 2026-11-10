import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import { getCorrectLetter, getOptions, type Mcq, type OptionLetter } from "@/shared/mcq";
import { OptionButton } from "./OptionButton";

export function ExamReview({
  mcqs,
  answers,
}: {
  mcqs: Mcq[];
  answers: Record<string, OptionLetter | undefined>;
}) {
  return (
    <section>
      <h2 className="text-2xl font-bold">Answer review</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Correct answers and explanations for every question.
      </p>
      <ol className="mt-6 space-y-5">
        {mcqs.map((m, i) => {
          const chosen = answers[m.id];
          const correct = getCorrectLetter(m);
          const status = !chosen ? "unanswered" : chosen === correct ? "correct" : "wrong";
          return (
            <li key={m.id} className="card-surface p-5 md:p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-sans text-base font-semibold leading-relaxed tracking-normal">
                  <span className="mr-2 font-display text-primary">Q{i + 1}.</span>
                  {m.question}
                </h3>
                {status === "correct" && <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-label="Correct" />}
                {status === "wrong" && <XCircle className="h-5 w-5 shrink-0 text-danger" aria-label="Incorrect" />}
                {status === "unanswered" && <MinusCircle className="h-5 w-5 shrink-0 text-muted-foreground" aria-label="Unanswered" />}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {getOptions(m).map((o) => (
                  <OptionButton
                    key={o.letter}
                    letter={o.letter}
                    text={o.text}
                    disabled
                    state={
                      o.letter === correct ? "correct" : o.letter === chosen ? "wrong" : "dimmed"
                    }
                  />
                ))}
              </div>
              {m.explanation && (
                <p className="mt-4 whitespace-pre-line rounded-lg bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">Explanation: </span>
                  {m.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
