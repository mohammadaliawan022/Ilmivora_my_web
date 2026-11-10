import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { McqInput } from "@/shared/data/mcq-repo";
import { EXAM_CATEGORIES } from "@/shared/exam-categories";
import { getCorrectLetter, validateMcqDraft, type Mcq } from "@/shared/mcq";
import { SUBJECTS } from "@/shared/subjects";

export const EMPTY_MCQ: McqInput = {
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "A",
  explanation: "",
  subject: SUBJECTS[0]!.name,
  exam_category: "PPSC",
  topic: null,
};

export const selectCls =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

const SUBJECT_NAMES = SUBJECTS.map((s) => s.name);

/** Shared MCQ fields for admin add/edit and student submissions. */
export function McqForm({
  initial,
  resetKey,
  onSubmit,
  pending,
  submitLabel,
  onCancel,
  children,
}: {
  initial?: Mcq | McqInput | null | undefined;
  /** Change to reset the form to `initial`. */
  resetKey?: unknown;
  onSubmit: (v: McqInput) => void;
  pending?: boolean | undefined;
  submitLabel: string;
  onCancel?: (() => void) | undefined;
  /** Extra fields rendered above the question (e.g. submitter name). */
  children?: ReactNode;
}) {
  const [v, setV] = useState<McqInput>(EMPTY_MCQ);
  const [errors, setErrors] = useState<string[]>([]);
  const errorSummaryRef = useRef<HTMLUListElement>(null);
  const hasOptionError = errors.some((error) => error.toLowerCase().includes("options"));

  useEffect(() => {
    setErrors([]);
    if (!initial) return setV(EMPTY_MCQ);
    const {
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      explanation,
      subject,
      exam_category,
    } = initial;
    const letter = getCorrectLetter({ ...EMPTY_MCQ, ...initial, id: "", created_at: "" } as Mcq);
    setV({
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      explanation,
      subject,
      exam_category,
      topic: null,
      correct_answer: letter ?? "A",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const set = <K extends keyof McqInput>(k: K, val: McqInput[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const problems = validateMcqDraft(v, SUBJECT_NAMES);
    setErrors(problems);
    if (problems.length) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }
    onSubmit({
      ...v,
      question: v.question.trim(),
      option_a: v.option_a.trim(),
      option_b: v.option_b.trim(),
      option_c: v.option_c.trim(),
      option_d: v.option_d.trim(),
      explanation: v.explanation?.trim() || null,
      topic: null,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {children}
      <div className="space-y-2">
        <Label htmlFor="mcq-subj">Subject</Label>
        <select
          id="mcq-subj"
          className={selectCls}
          aria-invalid={errors.some((error) => error.includes("subject"))}
          aria-describedby={
            errors.some((error) => error.includes("subject")) ? "mcq-subject-error" : undefined
          }
          value={v.subject}
          onChange={(e) => set("subject", e.target.value)}
        >
          {SUBJECTS.map((s) => (
            <option key={s.slug}>{s.name}</option>
          ))}
        </select>
        {errors.some((error) => error.includes("subject")) && (
          <p id="mcq-subject-error" className="text-sm text-destructive">
            Choose a subject from the list.
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="mcq-q">Question</Label>
        <Textarea
          id="mcq-q"
          value={v.question}
          onChange={(e) => set("question", e.target.value)}
          aria-invalid={errors.some((error) => error.includes("Question"))}
          aria-describedby={
            errors.some((error) => error.includes("Question")) ? "mcq-q-error" : undefined
          }
        />
        {errors.some((error) => error.includes("Question")) && (
          <p id="mcq-q-error" className="text-sm text-destructive">
            Enter a question with at least 10 characters.
          </p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["a", "b", "c", "d"] as const).map((l) => (
          <div key={l} className="space-y-2">
            <Label htmlFor={`mcq-o${l}`}>Option {l.toUpperCase()}</Label>
            <Input
              id={`mcq-o${l}`}
              value={v[`option_${l}`]}
              onChange={(e) => set(`option_${l}`, e.target.value)}
              aria-invalid={hasOptionError}
              aria-describedby={hasOptionError ? "mcq-options-error" : undefined}
            />
            {l === "a" && hasOptionError && (
              <p id="mcq-options-error" className="text-sm text-destructive">
                {errors.find((error) => error.toLowerCase().includes("options")) ===
                "All four options are required"
                  ? "Fill in all four options."
                  : "Make each option different."}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="mcq-ans">Correct answer</Label>
          <select
            id="mcq-ans"
            className={selectCls}
            value={v.correct_answer}
            onChange={(e) => set("correct_answer", e.target.value)}
            aria-invalid={errors.some((error) => error.includes("correct answer"))}
          >
            {["A", "B", "C", "D"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mcq-exam">Exam category</Label>
          <select
            id="mcq-exam"
            className={selectCls}
            value={v.exam_category ?? ""}
            onChange={(e) => set("exam_category", e.target.value || null)}
          >
            <option value="">None</option>
            {EXAM_CATEGORIES.map((c) => (
              <option key={c.code}>{c.code}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="mcq-exp">Explanation (optional)</Label>
        <Textarea
          id="mcq-exp"
          value={v.explanation ?? ""}
          onChange={(e) => set("explanation", e.target.value)}
        />
      </div>

      {errors.length > 0 && (
        <ul
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          aria-label="Form errors. Correct these items and submit again."
          className="space-y-1 rounded-lg bg-danger-soft px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {errors.map((e) => (
            <li key={e}>• {e}</li>
          ))}
        </ul>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
