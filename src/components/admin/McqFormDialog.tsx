import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { McqInput } from "@/lib/data/mcq-repo";
import { EXAM_CATEGORIES } from "@/lib/exam-categories";
import { getCorrectLetter, type Mcq } from "@/lib/mcq";
import { SUBJECTS } from "@/lib/subjects";

const EMPTY: McqInput = {
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

const selectCls =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export function McqFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  pending,
  gkCategories,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Mcq | null;
  onSubmit: (v: McqInput) => void;
  pending?: boolean;
  gkCategories: string[];
}) {
  const [v, setV] = useState<McqInput>(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      const { id: _id, created_at: _c, ...rest } = initial;
      setV({ ...rest, correct_answer: getCorrectLetter(initial) ?? "A" });
    } else setV(EMPTY);
  }, [open, initial]);

  const set = <K extends keyof McqInput>(k: K, val: McqInput[K]) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...v,
      explanation: v.explanation?.trim() || null,
      topic: v.subject === "General Knowledge" ? v.topic || null : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit MCQ" : "Add MCQ"}</DialogTitle>
          <DialogDescription>All four options and the correct answer are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="q">Question</Label>
            <Textarea id="q" required value={v.question} onChange={(e) => set("question", e.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["a", "b", "c", "d"] as const).map((l) => (
              <div key={l} className="space-y-2">
                <Label htmlFor={`o${l}`}>Option {l.toUpperCase()}</Label>
                <Input
                  id={`o${l}`}
                  required
                  value={v[`option_${l}`]}
                  onChange={(e) => set(`option_${l}`, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="ans">Correct answer</Label>
              <select id="ans" className={selectCls} value={v.correct_answer} onChange={(e) => set("correct_answer", e.target.value)}>
                {["A", "B", "C", "D"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subj">Subject</Label>
              <select id="subj" className={selectCls} value={v.subject} onChange={(e) => set("subject", e.target.value)}>
                {SUBJECTS.map((s) => (
                  <option key={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam">Exam category</Label>
              <select
                id="exam"
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
          {v.subject === "General Knowledge" && (
            <div className="space-y-2">
              <Label htmlFor="topic">GK topic</Label>
              <select
                id="topic"
                className={selectCls}
                value={v.topic ?? ""}
                onChange={(e) => set("topic", e.target.value || null)}
              >
                <option value="">Not categorised</option>
                {gkCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="exp">Explanation</Label>
            <Textarea id="exp" value={v.explanation ?? ""} onChange={(e) => set("explanation", e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {initial ? "Save changes" : "Add MCQ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
