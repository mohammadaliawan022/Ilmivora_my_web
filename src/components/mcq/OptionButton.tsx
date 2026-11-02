import { Check, X } from "lucide-react";
import type { OptionLetter } from "@/lib/mcq";
import { cn } from "@/lib/utils";

export type OptionState = "idle" | "selected" | "correct" | "wrong" | "dimmed";

export function OptionButton({
  letter,
  text,
  state,
  disabled,
  onClick,
}: {
  letter: OptionLetter;
  text: string;
  state: OptionState;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === "selected"}
      className={cn(
        "group flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-all md:text-base",
        "disabled:cursor-default",
        state === "idle" && "border-border bg-card hover:border-primary/50 hover:bg-primary-soft",
        state === "selected" && "border-primary bg-primary-soft",
        state === "correct" && "border-success bg-success-soft",
        state === "wrong" && "border-danger bg-danger-soft",
        state === "dimmed" && "border-border bg-card opacity-60",
      )}
    >
      <span
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold transition-colors",
          state === "idle" && "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground",
          state === "selected" && "bg-primary text-primary-foreground",
          state === "correct" && "bg-success text-success-foreground",
          state === "wrong" && "bg-danger text-destructive-foreground",
          state === "dimmed" && "bg-muted text-muted-foreground",
        )}
      >
        {state === "correct" ? <Check className="h-4 w-4" /> : state === "wrong" ? <X className="h-4 w-4" /> : letter}
      </span>
      <span className="pt-0.5 text-foreground">{text}</span>
    </button>
  );
}
