import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, FileText, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { createPastPaper, deletePastPaper, type PastPaperInput } from "@/shared/data/past-paper-repo";
import { pastPapersQuery } from "@/shared/data/queries";
import { EXAM_CATEGORIES } from "@/shared/exam-categories";

export function AdminPastPapers() {
  const queryClient = useQueryClient();
  const papers = useQuery(pastPapersQuery());
  const [title, setTitle] = useState("");
  const [exam, setExam] = useState(EXAM_CATEGORIES[0]?.code ?? "PPSC");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [url, setUrl] = useState("");

  const add = useMutation({
    mutationFn: (input: PastPaperInput) => createPastPaper(input),
    onSuccess: () => {
      toast.success("Past paper added");
      setTitle("");
      setUrl("");
      void queryClient.invalidateQueries({ queryKey: ["past-papers"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deletePastPaper(id),
    onSuccess: () => {
      toast.success("Past paper removed");
      void queryClient.invalidateQueries({ queryKey: ["past-papers"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsedYear = Number(year);
    if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
      toast.error("Enter a valid year.");
      return;
    }
    add.mutate({ title: title.trim(), exam, year: parsedYear, url: url.trim() || null });
  };

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="card-surface grid gap-3 p-6 md:grid-cols-[2fr_1fr_1fr_2fr_auto] md:items-end">
        <label className="space-y-1.5 text-sm font-medium">
          Title
          <Input required maxLength={300} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Lecturer English 2024" />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Exam
          <select
            value={exam}
            onChange={(event) => setExam(event.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {EXAM_CATEGORIES.map((category) => (
              <option key={category.code} value={category.code}>{category.code}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Year
          <Input required type="number" min={1900} max={2100} value={year} onChange={(event) => setYear(event.target.value)} />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          File link (optional)
          <Input type="url" maxLength={2048} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" />
        </label>
        <Button type="submit" disabled={add.isPending}>
          <Plus /> Add
        </Button>
      </form>

      {papers.isPending ? (
        <div className="space-y-2">{[1, 2, 3].map((n) => <Skeleton key={n} className="h-16 w-full rounded-xl" />)}</div>
      ) : papers.isError ? (
        <p role="alert" className="card-surface p-6 text-sm text-danger">{papers.error.message}</p>
      ) : papers.data.length === 0 ? (
        <p className="card-surface p-8 text-center text-sm text-muted-foreground">No past papers added yet.</p>
      ) : (
        <ul className="space-y-2">
          {papers.data.map((paper) => (
            <li key={paper.id} className="card-surface flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate font-semibold">{paper.title}</span>
                <span className="text-muted-foreground">{paper.exam} · {paper.year}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1">
                {paper.url && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={paper.url} target="_blank" rel="noreferrer" aria-label={`Open ${paper.title}`}><ExternalLink /></a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${paper.title}`}
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(paper.id)}
                >
                  <Trash2 className="text-danger" />
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
