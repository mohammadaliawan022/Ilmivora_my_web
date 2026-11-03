import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Check, Inbox, Pencil, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Pager } from "@/components/site/Pager";
import {
  approveSubmission,
  rejectSubmission,
  type McqInput,
  type McqSubmission,
  type SubmissionStatus,
} from "@/lib/data/mcq-repo";
import { submissionCountsQuery, submissionListQuery } from "@/lib/data/queries";
import { getCorrectLetter, getOptions, type Mcq } from "@/lib/mcq";
import { cn } from "@/lib/utils";
import { McqFormDialog } from "./McqFormDialog";

const STATUSES: Array<[SubmissionStatus, string]> = [
  ["pending", "Pending"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
];

export function AdminSubmissions({ gkCategories }: { gkCategories: string[] }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState<SubmissionStatus>("pending");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<McqSubmission | null>(null);
  const [rejecting, setRejecting] = useState<McqSubmission | null>(null);
  const [note, setNote] = useState("");

  const list = useQuery(submissionListQuery(status, page));
  const counts = useQuery(submissionCountsQuery());

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["submissions"] });
    qc.invalidateQueries({ queryKey: ["mcqs"] });
  };

  const approve = useMutation({
    mutationFn: ({ id, edits }: { id: string; edits?: McqInput }) => approveSubmission(id, edits),
    onSuccess: () => {
      toast.success("Approved — the MCQ is now live");
      setEditing(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reject = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string | null }) => rejectSubmission(id, note),
    onSuccess: () => {
      toast.success("Submission rejected");
      setRejecting(null);
      setNote("");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(([s, label]) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              status === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {label} <span className="ml-1 opacity-75">{counts.data?.[s] ?? 0}</span>
          </button>
        ))}
      </div>

      {list.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : list.data && list.data.items.length === 0 ? (
        <div className="card-surface flex flex-col items-center gap-3 p-10 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground" />
          <p className="font-semibold">
            {status === "pending" ? "No submissions waiting for review." : `No ${status} submissions.`}
          </p>
          {status === "pending" && (
            <p className="max-w-sm text-sm text-muted-foreground">
              Students can send MCQs from the “Submit MCQ” page. They will appear here.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {list.data?.items.map((s) => (
            <SubmissionCard
              key={s.id}
              sub={s}
              busy={approve.isPending || reject.isPending}
              onApprove={() => approve.mutate({ id: s.id })}
              onEdit={() => setEditing(s)}
              onReject={() => setRejecting(s)}
            />
          ))}
        </div>
      )}

      {list.data && (
        <Pager page={list.data.page} pageCount={list.data.pageCount} total={list.data.total} onChange={setPage} />
      )}

      <McqFormDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        initial={editing}
        pending={approve.isPending}
        onSubmit={(v) => editing && approve.mutate({ id: editing.id, edits: v })}
        gkCategories={gkCategories}
        title="Edit & approve submission"
        submitLabel="Save and approve"
      />

      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this submission?</DialogTitle>
            <DialogDescription className="line-clamp-3">{rejecting?.question}</DialogDescription>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason (optional), e.g. duplicate or wrong answer"
            aria-label="Reason for rejecting"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={reject.isPending}
              onClick={() => rejecting && reject.mutate({ id: rejecting.id, note: note.trim() || null })}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SubmissionCard({
  sub,
  busy,
  onApprove,
  onEdit,
  onReject,
}: {
  sub: McqSubmission;
  busy: boolean;
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
}) {
  const correct = getCorrectLetter(sub as unknown as Mcq);
  return (
    <article className="card-surface p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="soft">{sub.subject}</Badge>
        {sub.topic && <Badge variant="violet">{sub.topic}</Badge>}
        {sub.exam_category && <Badge variant="outline">{sub.exam_category}</Badge>}
        <span className="ml-auto">
          {sub.submitter_name ? `By ${sub.submitter_name} · ` : "Anonymous · "}
          {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
        </span>
      </div>
      <h3 className="mt-3 font-sans text-base font-semibold leading-relaxed tracking-normal">{sub.question}</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {getOptions(sub as unknown as Mcq).map((o) => (
          <li
            key={o.letter}
            className={cn(
              "flex gap-2 rounded-lg border px-3 py-2 text-sm",
              o.letter === correct ? "border-success bg-success-soft" : "border-border",
            )}
          >
            <span className="font-bold">{o.letter}.</span> {o.text}
          </li>
        ))}
      </ul>
      {sub.explanation && (
        <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Explanation: </span>
          {sub.explanation}
        </p>
      )}
      {sub.status === "rejected" && sub.review_note && (
        <p className="mt-3 text-sm text-danger">Reason: {sub.review_note}</p>
      )}
      {sub.status === "pending" && (
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={onReject}>
            <X /> Reject
          </Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={onEdit}>
            <Pencil /> Edit & approve
          </Button>
          <Button size="sm" disabled={busy} onClick={onApprove}>
            <Check /> Approve
          </Button>
        </div>
      )}
    </article>
  );
}
