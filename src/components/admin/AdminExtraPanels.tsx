import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { McqForm, selectCls } from "@/components/mcq/McqForm";
import { createMcq, deleteMcqsBySubject, type McqInput } from "@/lib/data/mcq-repo";
import { subjectCountsQuery } from "@/lib/data/queries";
import { SUBJECTS } from "@/lib/subjects";

export function AdminAddMcq({ gkCategories }: { gkCategories: string[] }) {
  const qc = useQueryClient();
  const [formKey, setFormKey] = useState(0);
  const save = useMutation({
    mutationFn: (v: McqInput) => createMcq(v),
    onSuccess: () => {
      toast.success("MCQ added");
      setFormKey((k) => k + 1);
      qc.invalidateQueries({ queryKey: ["mcqs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="card-surface max-w-3xl p-6 md:p-8">
      <h3 className="text-lg font-bold">Add a new MCQ</h3>
      <p className="mb-5 mt-1 text-sm text-muted-foreground">It goes live as soon as you save it.</p>
      <McqForm
        key={formKey}
        resetKey={formKey}
        onSubmit={(v) => save.mutate(v)}
        pending={save.isPending}
        submitLabel="Add MCQ"
        gkCategories={gkCategories}
      />
    </div>
  );
}

export function AdminDeleteBySubject() {
  const qc = useQueryClient();
  const [subject, setSubject] = useState("");
  const [confirm, setConfirm] = useState("");
  const counts = useQuery(subjectCountsQuery());
  const count = subject ? counts.data?.[subject] ?? 0 : 0;
  const confirmed = !!subject && confirm.trim() === subject;

  const del = useMutation({
    mutationFn: () => deleteMcqsBySubject(subject),
    onSuccess: (n) => {
      toast.success(`Deleted ${n} MCQs from ${subject}`);
      setConfirm("");
      qc.invalidateQueries({ queryKey: ["mcqs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="card-surface max-w-2xl space-y-5 p-6 md:p-8">
      <div className="flex items-start gap-3 rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
        <p className="text-foreground">
          This permanently removes <strong>every MCQ</strong> in the chosen subject. It cannot be undone.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="del-subject">Subject</Label>
        <select
          id="del-subject"
          className={selectCls}
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setConfirm("");
          }}
        >
          <option value="">Choose a subject…</option>
          {SUBJECTS.map((s) => (
            <option key={s.slug} value={s.name}>
              {s.name} ({(counts.data?.[s.name] ?? 0).toLocaleString()})
            </option>
          ))}
        </select>
      </div>
      {subject && (
        <div className="space-y-2">
          <Label htmlFor="del-confirm">
            Type <span className="font-mono text-danger">{subject}</span> to confirm
          </Label>
          <Input id="del-confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
        </div>
      )}
      <Button
        variant="destructive"
        disabled={!confirmed || count === 0 || del.isPending}
        onClick={() => del.mutate()}
      >
        <Trash2 /> {subject ? `Delete ${count.toLocaleString()} MCQs` : "Delete MCQs"}
      </Button>
    </div>
  );
}
