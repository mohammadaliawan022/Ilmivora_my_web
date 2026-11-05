import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SearchBar({
  defaultValue = "",
  size = "default",
  className,
  autoFocus = false,
  onSubmitted,
}: {
  defaultValue?: string | undefined;
  size?: "default" | "lg";
  className?: string | undefined;
  autoFocus?: boolean;
  onSubmitted?: (() => void) | undefined;
}) {
  const [q, setQ] = useState(defaultValue);
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void navigate({ to: "/search", search: { q: q.trim() || undefined } });
    onSubmitted?.();
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      className={cn(
        "flex items-center gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-lift",
        className,
      )}
    >
      <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
      <input
        autoFocus={autoFocus}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search MCQs, subjects or topics…"
        aria-label="Search MCQs and subjects"
        className={cn(
          "min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground",
          size === "lg" ? "h-11 text-base" : "h-9 text-sm",
        )}
      />
      <Button type="submit" size={size === "lg" ? "lg" : "default"} className="rounded-xl">
        Search
      </Button>
    </form>
  );
}
