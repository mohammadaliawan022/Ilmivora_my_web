import { getTopicScope } from "../categories";
import type { Mcq } from "../mcq";
import { SAMPLE_MCQS } from "./sample-mcqs";
import { isPreviewMode, supabaseRest } from "../supabase";

/**
 * MCQ data access. Every page reads through these async functions so the
 * preview store can be swapped for live database queries without touching UI.
 */

export const DEFAULT_PAGE_SIZE = 10;

export interface McqFilters {
  subject?: string | undefined;
  /** Restrict the set to one or more selected subjects. */
  subjects?: string[] | undefined;
  /** A section name; also matches every section nested beneath it. */
  topic?: string | undefined;
  examCategory?: string | undefined;
  search?: string | undefined;
  /** Include hidden records for admin review only. */
  includeHidden?: boolean | undefined;
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
export const IS_PREVIEW_DATA = isPreviewMode;

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

function applyFilters(rows: Mcq[], f: McqFilters): Mcq[] {
  const q = f.search?.trim().toLowerCase();
  const topics = f.topic ? new Set(getTopicScope(f.topic).map((t) => t.toLowerCase())) : null;
  return rows.filter((m) => {
    if (!f.includeHidden && m.is_hidden) return false;
    if (f.subject && m.subject.toLowerCase() !== f.subject.toLowerCase()) return false;
    if (f.subjects?.length && !f.subjects.some((s) => s.toLowerCase() === m.subject.toLowerCase())) return false;
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

const byNewest = <T extends { created_at: string; id?: string }>(a: T, b: T) =>
  b.created_at.localeCompare(a.created_at) || String(a.id ?? "").localeCompare(String(b.id ?? ""));

const byOldest = <T extends { created_at: string; id?: string }>(a: T, b: T) =>
  a.created_at.localeCompare(b.created_at) || String(a.id ?? "").localeCompare(String(b.id ?? ""));

function toPage<T>(rows: T[], page: number, pageSize: number): Page<T> {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  return { items: rows.slice(start, start + pageSize), total: rows.length, page: safePage, pageSize, pageCount };
}

function makeMcqQuery(filters: McqFilters, page?: number, pageSize?: number) {
  // A unique tie-breaker keeps offset pagination stable when many imported MCQs share a timestamp.
  // Keep older questions first so newly uploaded MCQs are appended to the final pages.
  const query = new URLSearchParams({ select: "*", order: "created_at.asc,id.asc" });
  if (!filters.includeHidden) query.set("is_hidden", "eq.false");
  if (filters.subject) query.set("subject", `ilike.${filters.subject}`);
  else if (filters.subjects?.length) {
    query.set("subject", `in.(${filters.subjects.map((s) => `"${s.replaceAll('"', '\\"')}"`).join(",")})`);
  }
  if (filters.topic) {
    const topics = getTopicScope(filters.topic);
    const values = topics.length ? topics : [filters.topic];
    query.set("topic", `in.(${values.map((t) => `"${t.replaceAll('"', '\\"')}"`).join(",")})`);
  }
  if (filters.examCategory) query.set("exam_category", `ilike.${filters.examCategory}`);
  const search = filters.search?.trim().replace(/[(),"]/g, " ");
  if (search) {
    const pattern = `*${search}*`;
    query.set("or", `(question.ilike.${pattern},option_a.ilike.${pattern},option_b.ilike.${pattern},option_c.ilike.${pattern},option_d.ilike.${pattern},subject.ilike.${pattern})`);
  }
  if (page !== undefined && pageSize !== undefined) {
    const start = (Math.max(1, page) - 1) * pageSize;
    query.set("limit", String(pageSize));
    query.set("offset", String(start));
  }
  return query;
}

async function fetchAllMcqs(filters: McqFilters): Promise<Mcq[]> {
  const rows: Mcq[] = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const query = makeMcqQuery(filters);
    query.set("limit", String(pageSize));
    query.set("offset", String(offset));
    const { data } = await supabaseRest<Mcq[]>(`mcqs?${query}`);
    rows.push(...data);
    if (data.length < pageSize) return rows;
  }
}

/** Fetch every matching row for an admin export, including hidden MCQs. */
export async function getMcqsForExport(filters: McqFilters = {}): Promise<Mcq[]> {
  return fetchAllMcqs({ ...filters, includeHidden: true });
}

export async function listMcqs(
  filters: McqFilters,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<McqPage> {
  if (!IS_PREVIEW_DATA) {
    const readPage = async (targetPage: number) => {
      const query = makeMcqQuery(filters, targetPage, pageSize);
      return supabaseRest<Mcq[]>(`mcqs?${query}`, {
        prefer: "count=exact",
        headers: { range: `${(Math.max(1, targetPage) - 1) * pageSize}-${Math.max(1, targetPage) * pageSize - 1}` },
      });
    };
    let { data, response } = await readPage(page);
    const total = Number(response.headers.get("content-range")?.split("/")[1] ?? data.length);
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), pageCount);
    if (safePage !== page) ({ data, response } = await readPage(safePage));
    return { items: data, total, page: safePage, pageSize, pageCount };
  }
  await delay();
  return toPage(applyFilters(store, filters).sort(byOldest), page, pageSize);
}

export async function getRecentMcqs(limit = 6): Promise<Mcq[]> {
  if (!IS_PREVIEW_DATA) {
    const query = new URLSearchParams({ select: "*", is_hidden: "eq.false", order: "created_at.desc", limit: String(limit) });
    const { data } = await supabaseRest<Mcq[]>(`mcqs?${query}`);
    return data;
  }
  await delay();
  return store.filter((m) => !m.is_hidden).sort(byNewest).slice(0, limit);
}

export async function getQuizQuestions(filters: McqFilters, count: number): Promise<Mcq[]> {
  if (!IS_PREVIEW_DATA) {
    const shuffled = await fetchAllMcqs(filters);
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled.slice(0, count);
  }
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
  if (!IS_PREVIEW_DATA) {
    const counts: Record<string, number> = {};
    for (const mcq of await fetchAllMcqs({})) counts[mcq.subject] = (counts[mcq.subject] ?? 0) + 1;
    return counts;
  }
  await delay(60);
  const counts: Record<string, number> = {};
  for (const m of store) {
    if (m.is_hidden) continue;
    counts[m.subject] = (counts[m.subject] ?? 0) + 1;
  }
  return counts;
}

export async function getExamCategoryCounts(): Promise<Record<string, number>> {
  if (!IS_PREVIEW_DATA) {
    const counts: Record<string, number> = {};
    for (const mcq of await fetchAllMcqs({})) {
      const category = mcq.exam_category ?? "Other";
      counts[category] = (counts[category] ?? 0) + 1;
    }
    return counts;
  }
  await delay(60);
  const counts: Record<string, number> = {};
  for (const m of store) {
    if (m.is_hidden) continue;
    const k = m.exam_category ?? "Other";
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return counts;
}

/* ---------- Admin (preview store only; real writes go through secured server calls) ---------- */

export type McqInput = Omit<Mcq, "id" | "created_at">;

export async function setMcqHidden(id: string, isHidden: boolean): Promise<void> {
  if (!IS_PREVIEW_DATA) {
    const query = new URLSearchParams({ id: `eq.${id}`, select: "id" });
    const { data } = await supabaseRest<Array<{ id: string }>>(`mcqs?${query}`, {
      method: "PATCH",
      body: { is_hidden: isHidden },
      prefer: "return=representation",
    });
    if (!data.length) throw new Error("MCQ not found or this account does not have admin access.");
    return;
  }
  await delay();
  const existing = store.find((m) => m.id === id);
  if (!existing) throw new Error("MCQ not found");
  store = store.map((m) => (m.id === id ? { ...m, is_hidden: isHidden } : m));
}

export async function createMcq(input: McqInput): Promise<Mcq> {
  if (!IS_PREVIEW_DATA) {
    const { data } = await supabaseRest<Mcq[]>("mcqs?select=*", {
      method: "POST",
      body: input,
      prefer: "return=representation",
    });
    if (!data[0]) throw new Error("The MCQ was not created. Check that your account has admin access.");
    return data[0];
  }
  await delay();
  const row: Mcq = { ...input, id: `local-${crypto.randomUUID()}`, created_at: new Date().toISOString() };
  store = [row, ...store];
  return row;
}

export async function updateMcq(id: string, input: McqInput): Promise<Mcq> {
  if (!IS_PREVIEW_DATA) {
    const query = new URLSearchParams({ id: `eq.${id}`, select: "*" });
    const { data } = await supabaseRest<Mcq[]>(`mcqs?${query}`, {
      method: "PATCH",
      body: input,
      prefer: "return=representation",
    });
    if (!data[0]) throw new Error("MCQ not found or this account does not have admin access.");
    return data[0];
  }
  await delay();
  const existing = store.find((m) => m.id === id);
  if (!existing) throw new Error("MCQ not found");
  const row = { ...existing, ...input };
  store = store.map((m) => (m.id === id ? row : m));
  return row;
}

export async function deleteMcq(id: string): Promise<void> {
  if (!IS_PREVIEW_DATA) {
    const query = new URLSearchParams({ id: `eq.${id}`, select: "id" });
    const { data } = await supabaseRest<Array<{ id: number }>>(`mcqs?${query}`, {
      method: "DELETE",
      prefer: "return=representation",
    });
    if (!data.length) throw new Error("MCQ not found or this account does not have admin access.");
    return;
  }
  await delay();
  store = store.filter((m) => m.id !== id);
}

/** Delete every MCQ in one subject. Returns how many were removed. */
export async function deleteMcqsBySubject(subject: string): Promise<number> {
  if (!IS_PREVIEW_DATA) {
    const query = new URLSearchParams({ subject: `ilike.${subject}`, select: "id" });
    const { data } = await supabaseRest<Array<{ id: number }>>(`mcqs?${query}`, {
      method: "DELETE",
      prefer: "return=representation",
    });
    return data.length;
  }
  await delay(200);
  const before = store.length;
  store = store.filter((m) => m.subject.toLowerCase() !== subject.toLowerCase());
  return before - store.length;
}

export async function bulkInsertMcqs(rows: McqInput[]): Promise<number> {
  if (!IS_PREVIEW_DATA) {
    if (!rows.length) return 0;
    const { data } = await supabaseRest<Mcq[]>("mcqs?select=id", {
      method: "POST",
      body: rows,
      prefer: "return=representation",
    });
    return data.length;
  }
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
  if (!IS_PREVIEW_DATA) {
    const { data } = await supabaseRest<McqSubmission[]>("mcq_submissions?select=*", {
      method: "POST",
      body: input,
      prefer: "return=representation",
    });
    if (!data[0]) throw new Error("The submission was not saved.");
    return data[0];
  }
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
  if (!IS_PREVIEW_DATA) {
    const readPage = async (targetPage: number) => {
      const query = new URLSearchParams({
        select: "*",
        status: `eq.${status}`,
        order: "created_at.desc",
        limit: String(pageSize),
        offset: String((Math.max(1, targetPage) - 1) * pageSize),
      });
      return supabaseRest<McqSubmission[]>(`mcq_submissions?${query}`, {
        prefer: "count=exact",
        headers: { range: `${(Math.max(1, targetPage) - 1) * pageSize}-${Math.max(1, targetPage) * pageSize - 1}` },
      });
    };
    let { data, response } = await readPage(page);
    const total = Number(response.headers.get("content-range")?.split("/")[1] ?? data.length);
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), pageCount);
    if (safePage !== page) ({ data, response } = await readPage(safePage));
    return { items: data, total, page: safePage, pageSize, pageCount };
  }
  await delay();
  return toPage(submissions.filter((s) => s.status === status).sort(byNewest), page, pageSize);
}

export async function getSubmissionCounts(): Promise<Record<SubmissionStatus, number>> {
  if (!IS_PREVIEW_DATA) {
    const counts: Record<SubmissionStatus, number> = { pending: 0, approved: 0, rejected: 0 };
    const statuses: SubmissionStatus[] = ["pending", "approved", "rejected"];
    await Promise.all(statuses.map(async (status) => {
      const query = new URLSearchParams({ select: "id", status: `eq.${status}`, limit: "1" });
      const { response } = await supabaseRest<Array<{ id: string }>>(`mcq_submissions?${query}`, {
        method: "HEAD",
        prefer: "count=exact",
        headers: { range: "0-0" },
      });
      counts[status] = Number(response.headers.get("content-range")?.split("/")[1] ?? 0);
    }));
    return counts;
  }
  await delay(40);
  const counts: Record<SubmissionStatus, number> = { pending: 0, approved: 0, rejected: 0 };
  for (const s of submissions) counts[s.status]++;
  return counts;
}

/** Publish a pending submission as a live MCQ, optionally with admin edits. */
export async function approveSubmission(id: string, edits?: McqInput): Promise<Mcq> {
  if (!IS_PREVIEW_DATA) {
    const { data } = await supabaseRest<number>("rpc/approve_mcq_submission", {
      method: "POST",
      body: { p_submission_id: id, p_edits: edits ?? null },
    });
    const query = new URLSearchParams({ id: `eq.${data}`, select: "*" });
    const { data: mcqs } = await supabaseRest<Mcq[]>(`mcqs?${query}`);
    if (!mcqs[0]) throw new Error("The submission was approved, but its published MCQ could not be loaded.");
    return mcqs[0];
  }
  const sub = submissions.find((s) => s.id === id);
  if (!sub) throw new Error("Submission not found");
  if (sub.status !== "pending") throw new Error("This submission has already been reviewed");
  const { id: _id, submitter_name: _n, status: _s, review_note: _r, created_at: _c, reviewed_at: _ra, ...base } = sub;
  const mcq = await createMcq({ ...base, ...(edits ?? {}), submitter_name: sub.submitter_name });
  submissions = submissions.map((s) =>
    s.id === id ? { ...s, ...(edits ?? {}), status: "approved", reviewed_at: new Date().toISOString() } : s,
  );
  return mcq;
}

export async function rejectSubmission(id: string, note: string | null): Promise<void> {
  if (!IS_PREVIEW_DATA) {
    const query = new URLSearchParams({ id: `eq.${id}`, status: "eq.pending" });
    const { data } = await supabaseRest<McqSubmission[]>(`mcq_submissions?${query}`, {
      method: "PATCH",
      body: { status: "rejected", review_note: note, reviewed_at: new Date().toISOString() },
      prefer: "return=representation",
    });
    if (!data.length) throw new Error("Submission not found or this account does not have admin access.");
    return;
  }
  await delay();
  const sub = submissions.find((s) => s.id === id);
  if (!sub) throw new Error("Submission not found");
  if (sub.status !== "pending") throw new Error("This submission has already been reviewed");
  submissions = submissions.map((s) =>
    s.id === id ? { ...s, status: "rejected", review_note: note, reviewed_at: new Date().toISOString() } : s,
  );
}
