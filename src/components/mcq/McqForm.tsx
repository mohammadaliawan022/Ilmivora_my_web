import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { McqInput } from "@/lib/data/mcq-repo";
import { EXAM_CATEGORIES } from "@/lib/exam-categories";
import { getCorrectLetter, validateMcqDraft, type Mcq } from "@/lib/mcq";
import { SUBJECTS } from "@/lib/subjects";

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

  useEffect(() => {
    setErrors([]);
    if (!initial) return setV(EMPTY_MCQ);
    const { question, option_a, option_b, option_c, option_d, explanation, subject, exam_category } = initial;
    const letter = getCorrectLetter({ ...EMPTY_MCQ, ...initial, id: "", created_at: "" } as Mcq);
    setV({ question, option_a, option_b, option_c, option_d, explanation, subject, exam_category, topic: null, correct_answer: letter ?? "A" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const set = <K extends keyof McqInput>(k: K, val: McqInput[K]) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const problems = validateMcqDraft(v, SUBJECT_NAMES);
    setErrors(problems);
    if (problems.length) return;
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
            value={v.subject}
            onChange={(e) => set("subject", e.target.value)}
          >
            {SUBJECTS.map((s) => (
              <option key={s.slug}>{s.name}</option>
            ))}
          </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="mcq-q">Question</Label>
        <Textarea id="mcq-q" value={v.question} onChange={(e) => set("question", e.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["a", "b", "c", "d"] as const).map((l) => (
          <div key={l} className="space-y-2">
            <Label htmlFor={`mcq-o${l}`}>Option {l.toUpperCase()}</Label>
            <Input id={`mcq-o${l}`} value={v[`option_${l}`]} onChange={(e) => set(`option_${l}`, e.target.value)} />
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="mcq-ans">Correct answer</Label>
          <select id="mcq-ans" className={selectCls} value={v.correct_answer} onChange={(e) => set("correct_answer", e.target.value)}>
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
        <Textarea id="mcq-exp" value={v.explanation ?? ""} onChange={(e) => set("explanation", e.target.value)} />
      </div>

      {errors.length > 0 && (
        <ul role="alert" className="space-y-1 rounded-lg bg-danger-soft px-4 py-3 text-sm text-foreground">
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
