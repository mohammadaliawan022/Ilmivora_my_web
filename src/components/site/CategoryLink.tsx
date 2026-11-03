import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { Category } from "@/lib/categories";
import { GK_SUBJECT } from "@/lib/subjects";

/** Links a catalogue entry to its page (GK has its own pages). */
export function CategoryLink({
  cat,
  className,
  children,
}: {
  cat: Pick<Category, "slug" | "parent" | "name">;
  className?: string;
  children: ReactNode;
}) {
  if (cat.name === GK_SUBJECT)
    return (
      <Link to="/general-knowledge" className={className}>
        {children}
      </Link>
    );
  if (cat.parent === GK_SUBJECT)
    return (
      <Link to="/general-knowledge/$topic" params={{ topic: cat.slug }} className={className}>
        {children}
      </Link>
    );
  return (
    <Link to="/subjects/$slug" params={{ slug: cat.slug }} className={className}>
      {children}
    </Link>
  );
}
