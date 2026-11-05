/** Shape of a row in the existing `public.mcqs` table (topic is planned, nullable). */
export interface Mcq {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
  subject: string;
  exam_category: string | null;
  topic: string | null;
  /** Optional public contributor credit copied from an approved submission. */
  submitter_name?: string | null;
  created_at: string;
}

export type OptionLetter = "A" | "B" | "C" | "D";
export const OPTION_LETTERS: OptionLetter[] = ["A", "B", "C", "D"];

export function getOptions(mcq: Mcq): Array<{ letter: OptionLetter; text: string }> {
  return [
    { letter: "A", text: mcq.option_a },
    { letter: "B", text: mcq.option_b },
    { letter: "C", text: mcq.option_c },
    { letter: "D", text: mcq.option_d },
  ];
}

/**
 * The stored correct_answer may be a letter ("A", "b", "Option C") or the
 * full option text. Normalise it to a letter, or null if it can't be matched.
 */
export function getCorrectLetter(mcq: Mcq): OptionLetter | null {
  const raw = (mcq.correct_answer ?? "").trim();
  if (!raw) return null;
  const letterMatch = raw.match(/^(?:option\s*)?\(?([a-d])\)?[.)]?$/i);
  if (letterMatch) return letterMatch[1]!.toUpperCase() as OptionLetter;
  const lower = raw.toLowerCase();
  const found = getOptions(mcq).find((o) => o.text.trim().toLowerCase() === lower);
  return found ? found.letter : null;
}

/** Seconds allowed per question in Exam Mode. */
export const EXAM_SECONDS_PER_QUESTION = 30;

export interface ExamScore {
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  percentage: number;
}

/** Score an exam. Unanswered questions count as neither correct nor incorrect. */
export function scoreExam(
  mcqs: Mcq[],
  answers: Record<string, OptionLetter | undefined>,
): ExamScore {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;
  for (const m of mcqs) {
    const a = answers[m.id];
    if (!a) unanswered++;
    else if (a === getCorrectLetter(m)) correct++;
    else incorrect++;
  }
  const total = mcqs.length;
  const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { total, correct, incorrect, unanswered, percentage };
}

/** Questions shown per page in Practice Mode. */
export const PRACTICE_PAGE_SIZE = 10;

/** Split a practice set into pages of PRACTICE_PAGE_SIZE questions. */
export function paginate<T>(items: T[], pageSize = PRACTICE_PAGE_SIZE): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += pageSize) pages.push(items.slice(i, i + pageSize));
  return pages;
}

export interface McqDraft {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  subject: string;
}

/**
 * Check a submitted or hand-entered MCQ. Returns a list of problems
 * (empty when the MCQ is valid). `knownSubjects` is the subject catalogue.
 */
export function validateMcqDraft(d: McqDraft, knownSubjects: string[]): string[] {
  const errors: string[] = [];
  if (d.question.trim().length < 10) errors.push("Question must be at least 10 characters");
  const opts = [d.option_a, d.option_b, d.option_c, d.option_d].map((o) => o.trim());
  if (opts.some((o) => !o)) errors.push("All four options are required");
  else if (new Set(opts.map((o) => o.toLowerCase())).size < 4)
    errors.push("Options must all be different");
  if (!/^[ABCD]$/.test(d.correct_answer)) errors.push("Choose the correct answer (A–D)");
  if (!knownSubjects.some((s) => s.toLowerCase() === d.subject.trim().toLowerCase()))
    errors.push("Choose a subject from the list");
  return errors;
}
