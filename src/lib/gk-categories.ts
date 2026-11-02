import { getCategoryBySlug, getChildren } from "./categories";
import { GK_SUBJECT } from "./subjects";

/**
 * General Knowledge topic categories — the 43 sections listed under
 * "General Knowledge" in the owner's catalogue. Each name matches the
 * value stored in the MCQ `topic` column.
 */
export const GK_CATEGORY_TARGET_COUNT = 43;

export interface GkCategory {
  name: string;
  slug: string;
}

export const GK_CATEGORY_NAMES: string[] = getChildren(GK_SUBJECT).map((c) => c.name);

export function getGkCategories(names: string[] = GK_CATEGORY_NAMES): GkCategory[] {
  return names.map((name) => ({ name, slug: slugFor(name) }));
}

export function getGkCategoryBySlug(
  slug: string,
  names: string[] = GK_CATEGORY_NAMES,
): GkCategory | undefined {
  return getGkCategories(names).find((c) => c.slug === slug);
}

function slugFor(name: string): string {
  const cat = getChildren(GK_SUBJECT).find((c) => c.name === name);
  if (cat) return cat.slug;
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isGkCategorySlug(slug: string): boolean {
  return getCategoryBySlug(slug)?.parent === GK_SUBJECT;
}
