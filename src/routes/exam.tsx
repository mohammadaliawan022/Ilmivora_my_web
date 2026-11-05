import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { QuizLauncher } from "@/components/mcq/QuizLauncher";
import { EXAM_NEGATIVE_MARKS_PER_WRONG, EXAM_SECONDS_PER_QUESTION } from "@/lib/mcq";

type Search = { subject?: string | undefined; exam?: string | undefined };

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

export const Route = createFileRoute("/exam")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    subject: str(s["subject"]),
    exam: str(s["exam"]),
  }),
  head: () => ({
    meta: [
      { title: "Exam Mode — Timed MCQ Test | Ilmivora" },
      {
        name: "description",
        content:
          "Simulate the real exam: 30 seconds per question, free navigation and a full answer review at the end.",
      },
      { property: "og:title", content: "Exam Mode — Ilmivora" },
      { property: "og:description", content: "Timed MCQ exams with a detailed final review." },
    ],
  }),
  component: ExamPage,
});

function ExamPage() {
  const { subject, exam } = Route.useSearch();
  return (
    <>
      <PageHeader
        eyebrow="Exam mode"
        title="Timed exam"
        description={`${EXAM_SECONDS_PER_QUESTION} seconds per question. Scoring: +1 for a correct answer, −${EXAM_NEGATIVE_MARKS_PER_WRONG} for an incorrect answer, and 0 for unanswered questions.`}
      />
      <div className="container-page py-10">
        <QuizLauncher
          key={`${subject}-${exam}`}
          mode="exam"
          initialSubject={subject}
          initialExam={exam}
        />
      </div>
    </>
  );
}
