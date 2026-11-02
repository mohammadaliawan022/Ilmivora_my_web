import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Ilmivora" },
      { name: "description", content: "Ilmivora helps students across Pakistan prepare for PPSC, FPSC, NTS and other competitive exams." },
      { property: "og:title", content: "About Ilmivora" },
      { property: "og:description", content: "Our mission: smarter preparation for Pakistan's competitive exams." },
    ],
  }),
  component: () => (
    <InfoPage eyebrow="About" title="About Ilmivora" description="Smarter preparation for Pakistan's competitive exams.">
      <p>
        <strong>Ilmivora</strong> — from <em>ilm</em>, knowledge — is an MCQ preparation platform for
        students preparing for PPSC, FPSC, NTS and other competitive examinations across Pakistan.
      </p>
      <p>
        Every question comes with the correct answer and a clear explanation, organised by subject and
        topic so you can focus on what matters for your exam.
      </p>
      <h2>What you can do</h2>
      <p>
        Browse MCQs across 36 subjects, practise with instant feedback, simulate the real exam with a
        timer, and track your progress over time.
      </p>
    </InfoPage>
  ),
});
