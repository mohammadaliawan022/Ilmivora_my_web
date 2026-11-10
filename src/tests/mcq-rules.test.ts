import { describe, expect, it } from "vitest";
import { csvToMcqs } from "@/shared/csv";
import {
  EXAM_SECONDS_PER_QUESTION,
  PRACTICE_PAGE_SIZE,
  getCorrectLetter,
  paginate,
  scoreExam,
  validateMcqDraft,
  type Mcq,
} from "@/shared/mcq";
import { SUBJECTS } from "@/shared/subjects";
import { CATEGORIES, DOMAINS, getTopicScope } from "@/shared/categories";
import { GK_CATEGORY_NAMES, GK_CATEGORY_TARGET_COUNT } from "@/shared/gk-categories";
import {
  approveSubmission,
  deleteMcqsBySubject,
  listMcqs,
  listSubmissions,
  rejectSubmission,
  submitMcq,
} from "@/shared/data/mcq-repo";

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

describe("catalogue (owner's subject-names.csv)", () => {
  it("has 1,236 entries, 53 top-level subjects and 11 fields", () => {
    expect(CATEGORIES).toHaveLength(1236);
    expect(SUBJECTS).toHaveLength(53);
    expect(DOMAINS).toHaveLength(11);
  });
  it("lists exactly the owner's 43 GK categories", () => {
    expect(GK_CATEGORY_TARGET_COUNT).toBe(43);
    expect(GK_CATEGORY_NAMES).toHaveLength(43);
    expect(GK_CATEGORY_NAMES).toContain("Airlines of the World");
    expect(GK_CATEGORY_NAMES).toContain("World Records");
  });
  it("a section's MCQ list includes its nested sections", () => {
    expect(getTopicScope("Ages, era, period")).toEqual(
      expect.arrayContaining(["Ages, era, period", "16th Century", "20th Century"]),
    );
  });
});

describe("practice mode", () => {
  it("shows 10 questions per page", () => {
    expect(PRACTICE_PAGE_SIZE).toBe(10);
    const pages = paginate(Array.from({ length: 25 }, (_, i) => i));
    expect(pages.map((p) => p.length)).toEqual([10, 10, 5]);
  });
});

describe("MCQ submission checks", () => {
  const draft = {
    question: "What is the capital of Pakistan?",
    option_a: "Karachi",
    option_b: "Lahore",
    option_c: "Islamabad",
    option_d: "Peshawar",
    correct_answer: "C",
    subject: "General Knowledge",
  };
  it("accepts a complete MCQ", () => {
    expect(validateMcqDraft(draft, ["General Knowledge"])).toEqual([]);
  });
  it("rejects missing or duplicate options and unknown subjects", () => {
    expect(validateMcqDraft({ ...draft, option_d: "" }, ["General Knowledge"])).toContain(
      "All four options are required",
    );
    expect(validateMcqDraft({ ...draft, option_d: "karachi" }, ["General Knowledge"])).toContain(
      "Options must all be different",
    );
    expect(validateMcqDraft({ ...draft, subject: "Astrology" }, ["General Knowledge"])).toContain(
      "Choose a subject from the list",
    );
  });
});

describe("student submissions", () => {
  const input = {
    question: "Zxq unique test question about the anthem?",
    option_a: "Allama Iqbal",
    option_b: "Hafeez Jalandhari",
    option_c: "Faiz Ahmed Faiz",
    option_d: "Ahmed Faraz",
    correct_answer: "B",
    explanation: null,
    subject: "Pakistan Studies",
    exam_category: "PPSC",
    topic: null,
    submitter_name: "Ali",
  };
  it("stays hidden until an admin approves it", async () => {
    const sub = await submitMcq(input);
    const before = await listMcqs({ search: "Zxq unique" });
    expect(before.total).toBe(0);
    await approveSubmission(sub.id);
    const after = await listMcqs({ search: "Zxq unique" });
    expect(after.total).toBe(1);
    expect((await listSubmissions("approved")).items.map((s) => s.id)).toContain(sub.id);
  });
  it("rejected submissions never go live and cannot be approved later", async () => {
    const sub = await submitMcq({ ...input, question: "Rejected sample question text?" });
    await rejectSubmission(sub.id, "duplicate");
    await expect(approveSubmission(sub.id)).rejects.toThrow();
    expect((await listMcqs({ search: "Rejected sample" })).total).toBe(0);
  });
});

describe("delete by subject", () => {
  it("removes only that subject's MCQs", async () => {
    const urduBefore = (await listMcqs({ subject: "Urdu" })).total;
    const physicsBefore = (await listMcqs({ subject: "Physics" })).total;
    expect(urduBefore).toBeGreaterThan(0);
    expect(await deleteMcqsBySubject("Urdu")).toBe(urduBefore);
    expect((await listMcqs({ subject: "Urdu" })).total).toBe(0);
    expect((await listMcqs({ subject: "Physics" })).total).toBe(physicsBefore);
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
    expect(r.rows[0]?.question).toBe("Capital, of Pakistan?");
    expect(r.errors).toEqual([{ line: 3, message: "correct_answer must be A–D or match an option" }]);
  });
  it("reports missing required columns", () => {
    expect(csvToMcqs("question,option_a\nx,y").missingColumns).toContain("correct_answer");
  });
});
