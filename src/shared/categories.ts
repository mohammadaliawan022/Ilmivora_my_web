import { CATEGORY_ROWS } from "./category-data";

/**
 * Owner-supplied subject tree. Top-level entries are subjects (stored in the
 * MCQ `subject` column); every nested entry is a section (stored in `topic`).
 * Names are unique across the whole catalogue.
 */
export interface Category {
  name: string;
  slug: string;
  domain: string;
  parent: string | null;
}

export const CATEGORIES: Category[] = CATEGORY_ROWS.map(([name, domain, parent, slug]) => ({
  name,
  slug,
  domain,
  parent: parent || null,
}));

/** Fields of study, in the order they first appear in the owner's list. */
export const DOMAINS: string[] = [...new Set(CATEGORIES.map((c) => c.domain))];

const bySlug = new Map(CATEGORIES.map((c) => [c.slug, c]));
const byName = new Map(CATEGORIES.map((c) => [c.name.toLowerCase(), c]));
const childrenOf = new Map<string, Category[]>();
for (const c of CATEGORIES) {
  if (!c.parent) continue;
  const list = childrenOf.get(c.parent) ?? [];
  list.push(c);
  childrenOf.set(c.parent, list);
}
for (const list of childrenOf.values()) list.sort((a, b) => a.name.localeCompare(b.name));

export const TOP_LEVEL_CATEGORIES = CATEGORIES.filter((c) => !c.parent);

export function getCategoryBySlug(slug: string): Category | undefined {
  return bySlug.get(slug);
}

export function getCategoryByName(name: string): Category | undefined {
  return byName.get(name.trim().toLowerCase());
}

export function getChildren(name: string): Category[] {
  return childrenOf.get(name) ?? [];
}

/** Every section below a category, depth-first, with its depth (1 = direct child). */
export function getDescendants(name: string): Array<Category & { depth: number }> {
  const out: Array<Category & { depth: number }> = [];
  const walk = (n: string, depth: number) => {
    for (const c of getChildren(n)) {
      out.push({ ...c, depth });
      walk(c.name, depth + 1);
    }
  };
  walk(name, 1);
  return out;
}

/** Ancestors from the top-level subject down to (and including) the category. */
export function getPath(cat: Category): Category[] {
  const path: Category[] = [cat];
  let cur = cat;
  while (cur.parent) {
    const p = byName.get(cur.parent.toLowerCase());
    if (!p) break;
    path.unshift(p);
    cur = p;
  }
  return path;
}

export function getRootSubject(cat: Category): Category {
  return getPath(cat)[0]!;
}

/**
 * Topic names an MCQ list for this section should include: the section
 * itself plus everything nested under it.
 */
export function getTopicScope(topic: string): string[] {
  const cat = getCategoryByName(topic);
  if (!cat) return [topic];
  return [cat.name, ...getDescendants(cat.name).map((d) => d.name)];
}
