import { describe, expect, it } from "vitest";
import { csvToMcqs } from "@/lib/csv";
import { EXAM_SECONDS_PER_QUESTION, getCorrectLetter, scoreExam, type Mcq } from "@/lib/mcq";
import { SUBJECTS } from "@/lib/subjects";
import { GK_CATEGORY_NAMES, GK_CATEGORY_TARGET_COUNT } from "@/lib/gk-categories";

const base: Mcq = {
  id: "1",
  question: "Q",
  option_a: "Alpha",
  option_b: "Beta",
  option_c: "Gamma",
  option_d: "Delta",
  correct_answer: "B",
  explanation: null,
  subject: "General Knowledge",
  exam_category: "PPSC",
  topic: null,
  created_at: "2026-01-01T00:00:00Z",
};

describe("exam rules", () => {
  it("gives 30 seconds per question in exam mode", () => {
    expect(EXAM_SECONDS_PER_QUESTION).toBe(30);
  });

  it("scores correct, incorrect, unanswered and percentage", () => {
    const mcqs = [
      { ...base, id: "a", correct_answer: "A" },
      { ...base, id: "b", correct_answer: "B" },
      { ...base, id: "c", correct_answer: "C" },
      { ...base, id: "d", correct_answer: "D" },
    ];
    const s = scoreExam(mcqs, { a: "A", b: "C", c: "C" });
    expect(s).toEqual({ total: 4, correct: 2, incorrect: 1, unanswered: 1, percentage: 50 });
  });
});

describe("correct answer formats", () => {
  it("accepts a letter in any case", () => {
    expect(getCorrectLetter({ ...base, correct_answer: "c" })).toBe("C");
    expect(getCorrectLetter({ ...base, correct_answer: "Option D" })).toBe("D");
  });
  it("accepts the full option text", () => {
    expect(getCorrectLetter({ ...base, correct_answer: "gamma" })).toBe("C");
  });
});

describe("catalogue", () => {
  it("has exactly 36 subjects", () => {
    expect(SUBJECTS).toHaveLength(36);
  });
  it("targets 43 GK categories and invents none", () => {
    expect(GK_CATEGORY_TARGET_COUNT).toBe(43);
    expect(GK_CATEGORY_NAMES).toHaveLength(0);
  });
});

describe("CSV import", () => {
  it("rejects rows with an invalid correct_answer", () => {
    const csv =
      "question,option_a,option_b,option_c,option_d,correct_answer,subject\n" +
      '"Capital, of Pakistan?",Karachi,Lahore,Islamabad,Peshawar,C,General Knowledge\n' +
      "Bad,1,2,3,4,E,Mathematics\n";
    const r = csvToMcqs(csv);
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0].question).toBe("Capital, of Pakistan?");
    expect(r.errors).toEqual([{ line: 3, message: "correct_answer must be A–D or match an option" }]);
  });
  it("reports missing required columns", () => {
    expect(csvToMcqs("question,option_a\nx,y").missingColumns).toContain("correct_answer");
  });
});
