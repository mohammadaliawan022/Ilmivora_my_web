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

/** Consolidated higher-level domains used to organise the subject catalogue. */
const SUPER_DOMAIN_BY_SOURCE_DOMAIN: Record<string, string> = {
  "General Knowledge & Affairs": "General Knowledge & Current Affairs",
  "Science & Technology": "Natural & Environmental Sciences",
  "Mathematics & Statistics": "Mathematics & Reasoning",
  "Languages & Literature": "Languages & Literature",
  "Social Sciences & Humanities": "Society, Governance & Law",
  "Education & Applied Sciences": "Education & Applied Studies",
  "Management Sciences": "Business & Management",
  Engineering: "Engineering & Technology",
  "Medical Sciences": "Health & Medical Sciences",
  "Recruitment & Service Tests": "Recruitment & Exam Preparation",
  "Reasoning & Intelligence": "Mathematics & Reasoning",
};

/** A few subjects need a more specific super-domain than their legacy label. */
const SUBJECT_SUPER_DOMAIN_OVERRIDES: Record<string, string> = {
  "islamic-studies": "History, Culture & Religion",
  "islamic-history-and-culture": "History, Culture & Religion",
  "comparative-study-of-major-religions": "History, Culture & Religion",
  philosophy: "History, Culture & Religion",
  history: "History, Culture & Religion",
  "history-of-pakistan-and-india": "History, Culture & Religion",
  "british-history": "History, Culture & Religion",
  "european-history": "History, Culture & Religion",
  "history-of-usa": "History, Culture & Religion",
  "computer-science": "Computing & Digital Technology",
  "computer-science-theory": "Computing & Digital Technology",
  bioinformatics: "Computing & Digital Technology",
  "pakistan-current-affairs-mcqs": "General Knowledge & Current Affairs",
  "world-current-affairs-mcqs": "General Knowledge & Current Affairs",
  "agriculture": "Agriculture, Forestry & Environment",
  forestry: "Agriculture, Forestry & Environment",
  "agriculture-and-forestry": "Agriculture, Forestry & Environment",
  "agriculture-economics": "Agriculture, Forestry & Environment",
  "agriculture-extension": "Agriculture, Forestry & Environment",
  "agriculture-crop-production": "Agriculture, Forestry & Environment",
  "agriculture-crop-protection": "Agriculture, Forestry & Environment",
  "agriculture-food-sciences": "Agriculture, Forestry & Environment",
  "agriculture-plant-genetics": "Agriculture, Forestry & Environment",
  "forestry-and-range-management": "Agriculture, Forestry & Environment",
  wildlife: "Agriculture, Forestry & Environment",
  "fine-arts": "Arts & Communication",
  "drawing-mcq": "Arts & Communication",
  "photography-mcqs": "Arts & Communication",
  "mass-communication": "Arts & Communication",
  "journalism-and-mass-communication": "Arts & Communication",
};

const categoryRowByName = new Map(CATEGORY_ROWS.map((row) => [row[0].toLowerCase(), row]));

function getRootRow(row: (typeof CATEGORY_ROWS)[number]) {
  let root = row;
  const visited = new Set<string>();
  while (root[2]) {
    const parentKey = root[2].toLowerCase();
    const parent = categoryRowByName.get(parentKey);
    if (!parent || visited.has(parentKey)) break;
    visited.add(parentKey);
    root = parent;
  }
  return root;
}

export const CATEGORIES: Category[] = CATEGORY_ROWS.map((row) => {
  const [name, sourceDomain, parent, slug] = row;
  const root = getRootRow(row);
  return {
    name,
    slug,
    domain: SUBJECT_SUPER_DOMAIN_OVERRIDES[root[3]] ?? SUPER_DOMAIN_BY_SOURCE_DOMAIN[root[1]] ?? sourceDomain,
    parent: parent || null,
  };
});

/** Subject super-domains, in the order they first appear in the catalogue. */
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
