import { getTopicScope } from "../categories";
import type { Mcq } from "../mcq";
import { SAMPLE_MCQS } from "./sample-mcqs";

/**
 * MCQ data access. Every page reads through these async functions so the
 * preview store can be swapped for live database queries without touching UI.
 */

export const DEFAULT_PAGE_SIZE = 10;

export interface McqFilters {
  subject?: string | undefined;
  /** A section name; also matches every section nested beneath it. */
  topic?: string | undefined;
  examCategory?: string | undefined;
  search?: string | undefined;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export type McqPage = Page<Mcq>;

let store: Mcq[] = [...SAMPLE_MCQS];
export const IS_PREVIEW_DATA = true;

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

function applyFilters(rows: Mcq[], f: McqFilters): Mcq[] {
  const q = f.search?.trim().toLowerCase();
  const topics = f.topic ? new Set(getTopicScope(f.topic).map((t) => t.toLowerCase())) : null;
  return rows.filter((m) => {
    if (f.subject && m.subject.toLowerCase() !== f.subject.toLowerCase()) return false;
    if (topics && !topics.has((m.topic ?? "").toLowerCase())) return false;
    if (f.examCategory && (m.exam_category ?? "").toLowerCase() !== f.examCategory.toLowerCase())
      return false;
    if (q) {
      const hay = `${m.question} ${m.option_a} ${m.option_b} ${m.option_c} ${m.option_d} ${m.subject}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

const byNewest = <T extends { created_at: string }>(a: T, b: T) => b.created_at.localeCompare(a.created_at);

function toPage<T>(rows: T[], page: number, pageSize: number): Page<T> {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  return { items: rows.slice(start, start + pageSize), total: rows.length, page: safePage, pageSize, pageCount };
}

export async function listMcqs(
  filters: McqFilters,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<McqPage> {
  await delay();
  return toPage(applyFilters(store, filters).sort(byNewest), page, pageSize);
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

/** Delete every MCQ in one subject. Returns how many were removed. */
export async function deleteMcqsBySubject(subject: string): Promise<number> {
  await delay(200);
  const before = store.length;
  store = store.filter((m) => m.subject.toLowerCase() !== subject.toLowerCase());
  return before - store.length;
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

/* ---------- Student submissions (reviewed by admins before going live) ---------- */

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface McqSubmission extends McqInput {
  id: string;
  submitter_name: string | null;
  status: SubmissionStatus;
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export type SubmissionInput = McqInput & { submitter_name: string | null };

let submissions: McqSubmission[] = [];

export async function submitMcq(input: SubmissionInput): Promise<McqSubmission> {
  await delay(200);
  const row: McqSubmission = {
    ...input,
    id: `sub-${crypto.randomUUID()}`,
    status: "pending",
    review_note: null,
    created_at: new Date().toISOString(),
    reviewed_at: null,
  };
  submissions = [row, ...submissions];
  return row;
}

export async function listSubmissions(
  status: SubmissionStatus,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<Page<McqSubmission>> {
  await delay();
  return toPage(submissions.filter((s) => s.status === status).sort(byNewest), page, pageSize);
}

export async function getSubmissionCounts(): Promise<Record<SubmissionStatus, number>> {
  await delay(40);
  const counts: Record<SubmissionStatus, number> = { pending: 0, approved: 0, rejected: 0 };
  for (const s of submissions) counts[s.status]++;
  return counts;
}

/** Publish a pending submission as a live MCQ, optionally with admin edits. */
export async function approveSubmission(id: string, edits?: McqInput): Promise<Mcq> {
  const sub = submissions.find((s) => s.id === id);
  if (!sub) throw new Error("Submission not found");
  if (sub.status !== "pending") throw new Error("This submission has already been reviewed");
  const { id: _id, submitter_name: _n, status: _s, review_note: _r, created_at: _c, reviewed_at: _ra, ...base } = sub;
  const mcq = await createMcq(edits ?? base);
  submissions = submissions.map((s) =>
    s.id === id ? { ...s, ...(edits ?? {}), status: "approved", reviewed_at: new Date().toISOString() } : s,
  );
  return mcq;
}

export async function rejectSubmission(id: string, note: string | null): Promise<void> {
  await delay();
  const sub = submissions.find((s) => s.id === id);
  if (!sub) throw new Error("Submission not found");
  if (sub.status !== "pending") throw new Error("This submission has already been reviewed");
  submissions = submissions.map((s) =>
    s.id === id ? { ...s, status: "rejected", review_note: note, reviewed_at: new Date().toISOString() } : s,
  );
}
