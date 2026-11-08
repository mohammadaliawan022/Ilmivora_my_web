import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Ilmivora" },
      { name: "description", content: "Ilmivora helps students across Pakistan prepare for PPSC, FPSC, NTS and other competitive exams." },
      { property: "og:title", content: "About Ilmivora" },
      { property: "og:description", content: "Our mission: smarter preparation for Pakistan's competitive exams." },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ilmivora-1.vercel.app/about" }],
  }),
  component: () => (
    <InfoPage eyebrow="About" title="About Ilmivora" description="Smarter preparation for Pakistan's competitive exams.">
      <p>
        <strong>Ilmivora</strong> — from <em>ilm</em>, knowledge — is an MCQ preparation platform for
        students preparing for PPSC, FPSC, NTS and other competitive examinations across Pakistan.
      </p>
      <p>
        Question banks are organised by subject. Questions display their answer and any explanation
        provided with the question so learners can review the reasoning.
      </p>
      <h2>What you can do</h2>
      <p>
        Browse the subject banks that currently have published questions, practise with instant
        feedback, use a timed exam mode, and track your progress in your browser.
      </p>
      <p>
        Ilmivora is an independent study resource. It is not affiliated with PPSC, FPSC, NTS, or any
        government department. For eligibility, application deadlines, test schedules and official
        syllabuses, candidates should rely on the relevant commission or testing service.
      </p>
    </InfoPage>
  ),
});
