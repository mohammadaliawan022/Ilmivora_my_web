/**
 * Test attempt history. Stored on this device for now; moves to the
 * user's account once sign-in and the database are connected.
 */
export interface TestAttempt {
  id: string;
  mode: "practice" | "exam";
  subject: string;
  topic?: string | null | undefined;
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  negativeMarks?: number;
  netMarks?: number;
  penaltyPerIncorrect?: number;
  percentage: number;
  durationSec: number;
  createdAt: string;
}

const KEY = "ilmivora-attempts";

export function loadAttempts(): TestAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TestAttempt[]) : [];
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: Omit<TestAttempt, "id" | "createdAt">): TestAttempt {
  const full: TestAttempt = {
    ...attempt,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const all = [full, ...loadAttempts()].slice(0, 200);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage full or disabled */
  }
  return full;
}

export interface AttemptSummary {
  totalTests: number;
  averageScore: number;
  totalQuestions: number;
  bySubject: Array<{ subject: string; tests: number; average: number }>;
}

export function summarizeAttempts(attempts: TestAttempt[]): AttemptSummary {
  const totalTests = attempts.length;
  const averageScore =
    totalTests === 0
      ? 0
      : Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / totalTests);
  const totalQuestions = attempts.reduce((s, a) => s + a.total, 0);
  const map = new Map<string, { tests: number; sum: number }>();
  for (const a of attempts) {
    const e = map.get(a.subject) ?? { tests: 0, sum: 0 };
    e.tests++;
    e.sum += a.percentage;
    map.set(a.subject, e);
  }
  const bySubject = [...map.entries()]
    .map(([subject, e]) => ({ subject, tests: e.tests, average: Math.round(e.sum / e.tests) }))
    .sort((a, b) => b.tests - a.tests);
  return { totalTests, averageScore, totalQuestions, bySubject };
}
