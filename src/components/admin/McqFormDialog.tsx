import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { McqForm } from "@/components/mcq/McqForm";
import type { McqInput } from "@/lib/data/mcq-repo";
import type { Mcq } from "@/lib/mcq";

export function McqFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  pending,
  gkCategories,
  title,
  submitLabel,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: (Mcq | McqInput) | null;
  onSubmit: (v: McqInput) => void;
  pending?: boolean;
  gkCategories: string[];
  title?: string;
  submitLabel?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title ?? (initial ? "Edit MCQ" : "Add MCQ")}</DialogTitle>
          <DialogDescription>All four options and the correct answer are required.</DialogDescription>
        </DialogHeader>
        <McqForm
          initial={initial}
          resetKey={open ? initial ?? "new" : null}
          onSubmit={onSubmit}
          pending={pending}
          submitLabel={submitLabel ?? (initial ? "Save changes" : "Add MCQ")}
          onCancel={() => onOpenChange(false)}
          gkCategories={gkCategories}
        />
      </DialogContent>
    </Dialog>
  );
}
