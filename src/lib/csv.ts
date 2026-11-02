import type { McqInput } from "./data/mcq-repo";

/** Minimal RFC 4180 CSV parser: quoted fields, escaped quotes, CRLF/LF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

export const REQUIRED_CSV_COLUMNS = [
  "question",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "correct_answer",
  "subject",
] as const;

export const OPTIONAL_CSV_COLUMNS = ["explanation", "exam_category", "topic"] as const;

export interface CsvImportResult {
  rows: McqInput[];
  errors: Array<{ line: number; message: string }>;
  missingColumns: string[];
}

export function csvToMcqs(text: string): CsvImportResult {
  const table = parseCsv(text);
  if (table.length === 0) return { rows: [], errors: [], missingColumns: [...REQUIRED_CSV_COLUMNS] };
  const header = table[0].map((h) => h.trim().toLowerCase());
  const missingColumns = REQUIRED_CSV_COLUMNS.filter((c) => !header.includes(c));
  if (missingColumns.length) return { rows: [], errors: [], missingColumns };

  const idx = (name: string) => header.indexOf(name);
  const get = (r: string[], name: string) => (idx(name) >= 0 ? (r[idx(name)] ?? "").trim() : "");

  const rows: McqInput[] = [];
  const errors: CsvImportResult["errors"] = [];
  table.slice(1).forEach((r, i) => {
    const line = i + 2;
    const missing = REQUIRED_CSV_COLUMNS.filter((c) => !get(r, c));
    if (missing.length) {
      errors.push({ line, message: `Missing ${missing.join(", ")}` });
      return;
    }
    const answer = get(r, "correct_answer");
    const opts = ["option_a", "option_b", "option_c", "option_d"].map((o) => get(r, o).toLowerCase());
    if (!/^[a-d]$/i.test(answer) && !opts.includes(answer.toLowerCase())) {
      errors.push({ line, message: "correct_answer must be A–D or match an option" });
      return;
    }
    rows.push({
      question: get(r, "question"),
      option_a: get(r, "option_a"),
      option_b: get(r, "option_b"),
      option_c: get(r, "option_c"),
      option_d: get(r, "option_d"),
      correct_answer: /^[a-d]$/i.test(answer) ? answer.toUpperCase() : answer,
      explanation: get(r, "explanation") || null,
      subject: get(r, "subject"),
      exam_category: get(r, "exam_category") || null,
      topic: get(r, "topic") || null,
    });
  });
  return { rows, errors, missingColumns: [] };
}
