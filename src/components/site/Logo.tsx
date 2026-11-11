import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { cn } from "@/shared/utils";

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)} aria-label="Ilmivora home">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
        <BookOpen aria-hidden="true" className="h-5 w-5" />
      </span>
      <span className={`font-display text-xl font-bold tracking-tight ${inverted ? "text-navy-foreground" : "text-foreground"}`}>Ilmivora.</span>
    </Link>
  );
}
