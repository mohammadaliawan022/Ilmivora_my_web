import type { Mcq } from "../mcq";
import { SAMPLE_MCQS } from "./sample-mcqs";

/**
 * MCQ data access. Every page reads through these async functions so the
 * preview store can be swapped for live database queries without touching UI.
 */

export const DEFAULT_PAGE_SIZE = 10;

export interface McqFilters {
  subject?: string | undefined;
  topic?: string | undefined;
  examCategory?: string | undefined;
  search?: string | undefined;
}

export interface McqPage {
  items: Mcq[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

let store: Mcq[] = [...SAMPLE_MCQS];
export const IS_PREVIEW_DATA = true;

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

function applyFilters(rows: Mcq[], f: McqFilters): Mcq[] {
  const q = f.search?.trim().toLowerCase();
  return rows.filter((m) => {
    if (f.subject && m.subject.toLowerCase() !== f.subject.toLowerCase()) return false;
    if (f.topic && (m.topic ?? "").toLowerCase() !== f.topic.toLowerCase()) return false;
    if (f.examCategory && (m.exam_category ?? "").toLowerCase() !== f.examCategory.toLowerCase())
      return false;
    if (q) {
      const hay = `${m.question} ${m.option_a} ${m.option_b} ${m.option_c} ${m.option_d} ${m.subject}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

const byNewest = (a: Mcq, b: Mcq) => b.created_at.localeCompare(a.created_at);

export async function listMcqs(
  filters: McqFilters,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<McqPage> {
  await delay();
  const rows = applyFilters(store, filters).sort(byNewest);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  return {
    items: rows.slice(start, start + pageSize),
    total: rows.length,
    page: safePage,
    pageSize,
    pageCount,
  };
}

export async function getRecentMcqs(limit = 6): Promise<Mcq[]> {
  await delay();
  return [...store].sort(byNewest).slice(0, limit);
}

export async function getQuizQuestions(filters: McqFilters, count: number): Promise<Mcq[]> {
  await delay();
  const rows = applyFilters(store, filters);
  const shuffled = [...rows];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = tmp;
  }
  return shuffled.slice(0, count);
}

export async function getSubjectCounts(): Promise<Record<string, number>> {
  await delay(60);
  const counts: Record<string, number> = {};
  for (const m of store) counts[m.subject] = (counts[m.subject] ?? 0) + 1;
  return counts;
}

export async function getExamCategoryCounts(): Promise<Record<string, number>> {
  await delay(60);
  const counts: Record<string, number> = {};
  for (const m of store) {
    const k = m.exam_category ?? "Other";
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return counts;
}

/* ---------- Admin (preview store only; real writes go through secured server calls) ---------- */

export type McqInput = Omit<Mcq, "id" | "created_at">;

export async function createMcq(input: McqInput): Promise<Mcq> {
  await delay();
  const row: Mcq = { ...input, id: `local-${crypto.randomUUID()}`, created_at: new Date().toISOString() };
  store = [row, ...store];
  return row;
}

export async function updateMcq(id: string, input: McqInput): Promise<Mcq> {
  await delay();
  const existing = store.find((m) => m.id === id);
  if (!existing) throw new Error("MCQ not found");
  const row = { ...existing, ...input };
  store = store.map((m) => (m.id === id ? row : m));
  return row;
}

export async function deleteMcq(id: string): Promise<void> {
  await delay();
  store = store.filter((m) => m.id !== id);
}

export async function bulkInsertMcqs(rows: McqInput[]): Promise<number> {
  await delay(300);
  const now = Date.now();
  const created = rows.map((r, i) => ({
    ...r,
    id: `local-${crypto.randomUUID()}`,
    created_at: new Date(now - i).toISOString(),
  }));
  store = [...created, ...store];
  return created.length;
}
