import { Link } from "@tanstack/react-router";
import { cn } from "@/shared/utils";

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)} aria-label="Ilmivora home">
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-brand shadow-lift">
        <span className="font-urdu text-base leading-none text-primary-foreground" aria-hidden>
          ع
        </span>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-xl font-bold tracking-tight",
            inverted ? "text-navy-foreground" : "text-foreground",
          )}
        >
          Ilmivora
        </span>
        <span
          className={cn(
            "mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em]",
            inverted ? "text-navy-foreground/60" : "text-muted-foreground",
          )}
        >
          Exam Prep
        </span>
      </span>
    </Link>
  );
}
