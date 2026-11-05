import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { QuizLauncher } from "@/components/mcq/QuizLauncher";

type Search = { subject?: string | undefined; exam?: string | undefined };

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

export const Route = createFileRoute("/practice")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    subject: str(s["subject"]),
    exam: str(s["exam"]),
  }),
  head: () => ({
    meta: [
      { title: "Practice Test — Ilmivora" },
      {
        name: "description",
        content:
          "Practise MCQs 10 per page with instant feedback, highlighted answers and explanations.",
      },
      { property: "og:title", content: "Practice Test — Ilmivora" },
      { property: "og:description", content: "Instant-feedback MCQ practice with explanations." },
    ],
  }),
  component: PracticePage,
});

function PracticePage() {
  const { subject, exam } = Route.useSearch();
  return (
    <>
      <PageHeader
        eyebrow="Practice mode"
        title="Practice test"
        description="10 questions per page — answer each one and learn from every explanation."
      />
      <div className="container-page py-10">
        <QuizLauncher
          key={`${subject}-${exam}`}
          mode="practice"
          initialSubject={subject}
          initialExam={exam}
        />
      </div>
    </>
  );
}
