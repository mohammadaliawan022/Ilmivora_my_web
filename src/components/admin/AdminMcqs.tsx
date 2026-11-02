import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pager } from "@/components/site/Pager";
import { createMcq, deleteMcq, updateMcq, type McqInput } from "@/lib/data/mcq-repo";
import { mcqListQuery } from "@/lib/data/queries";
import { getCorrectLetter, type Mcq } from "@/lib/mcq";
import { SUBJECTS } from "@/lib/subjects";
import { McqFormDialog } from "./McqFormDialog";

export function AdminMcqs({ gkCategories }: { gkCategories: string[] }) {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [editing, setEditing] = useState<Mcq | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Mcq | null>(null);

  const list = useQuery(mcqListQuery({ search: search || undefined, subject: subject || undefined }, page, 15));
  const invalidate = () => qc.invalidateQueries({ queryKey: ["mcqs"] });

  const save = useMutation({
    mutationFn: (v: McqInput) => (editing ? updateMcq(editing.id, v) : createMcq(v)),
    onSuccess: () => {
      toast.success(editing ? "MCQ updated" : "MCQ added");
      setFormOpen(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteMcq(id),
    onSuccess: () => {
      toast.success("MCQ deleted");
      setToDelete(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search questions…"
          aria-label="Search questions"
          className="h-10 flex-1 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by subject"
          className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s.slug}>{s.name}</option>
          ))}
        </select>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus /> Add MCQ
        </Button>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Question</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Exam</th>
                <th className="px-4 py-3 font-semibold">Answer</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.isPending &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}
              {list.data?.items.map((m) => (
                <tr key={m.id} className="align-top">
                  <td className="max-w-md px-4 py-3 font-medium">
                    <span className="line-clamp-2">{m.question}</span>
                    {m.topic && <Badge variant="violet" className="mt-1">{m.topic}</Badge>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{m.subject}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.exam_category ?? "—"}</td>
                  <td className="px-4 py-3 font-display font-bold text-success">{getCorrectLetter(m) ?? "?"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit MCQ"
                      onClick={() => {
                        setEditing(m);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Delete MCQ" onClick={() => setToDelete(m)}>
                      <Trash2 className="text-danger" />
                    </Button>
                  </td>
                </tr>
              ))}
              {list.data && list.data.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No MCQs match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {list.data && (
        <Pager page={list.data.page} pageCount={list.data.pageCount} total={list.data.total} onChange={setPage} />
      )}

      <McqFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        pending={save.isPending}
        onSubmit={(v) => save.mutate(v)}
        gkCategories={gkCategories}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this MCQ?</AlertDialogTitle>
            <AlertDialogDescription className="line-clamp-3">{toDelete?.question}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => toDelete && remove.mutate(toDelete.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
