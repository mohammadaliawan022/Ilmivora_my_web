import { slugify } from "./subjects";

/**
 * General Knowledge topic categories.
 *
 * The official list of 43 categories will be supplied by the site owner.
 * Do NOT invent names here — add them exactly as provided. Each name must
 * match the value stored in the `topic` column of the MCQ table.
 */
export const GK_CATEGORY_NAMES: string[] = [];

export const GK_CATEGORY_TARGET_COUNT = 43;

export interface GkCategory {
  name: string;
  slug: string;
}

export function getGkCategories(names: string[] = GK_CATEGORY_NAMES): GkCategory[] {
  return names.map((name) => ({ name, slug: slugify(name) }));
}

export function getGkCategoryBySlug(
  slug: string,
  names: string[] = GK_CATEGORY_NAMES,
): GkCategory | undefined {
  return getGkCategories(names).find((c) => c.slug === slug);
}
