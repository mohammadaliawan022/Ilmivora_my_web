import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { Category } from "@/shared/categories";
import { GK_SUBJECT } from "@/shared/subjects";

/** Links a subject to its page. */
export function CategoryLink({
  cat,
  className,
  children,
}: {
  cat: Pick<Category, "slug" | "name">;
  className?: string;
  children: ReactNode;
}) {
  if (cat.name === GK_SUBJECT)
    return (
      <Link to="/general-knowledge" className={className}>
        {children}
      </Link>
    );
  return (
    <Link to="/subjects/$slug" params={{ slug: cat.slug }} className={className}>
      {children}
    </Link>
  );
}
