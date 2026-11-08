import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenCheck, CalendarDays, CheckCircle2, ExternalLink, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/study-guides")({
  head: () => ({
    meta: [
      { title: "A Practical MCQ Study Guide for Competitive Exams | Ilmivora" },
      {
        name: "description",
        content: "A practical, subject-first plan for preparing for competitive exams in Pakistan: map the syllabus, practise recall, review mistakes and verify changing facts.",
      },
      { property: "og:title", content: "A Practical MCQ Study Guide | Ilmivora" },
      { property: "og:description", content: "Build a repeatable preparation routine with subject-based practice, a mistake log and official syllabus checks." },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://ilmivora-1.vercel.app/study-guides" }],
  }),
  component: StudyGuidesPage,
});

function StudyGuidesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Study guide"
        title="Prepare for MCQ exams with a plan you can repeat"
        description="A practical guide to turning a syllabus into short study sessions, useful question practice and better review."
      />
      <article className="container-page max-w-4xl space-y-10 py-12 text-base leading-relaxed text-muted-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_strong]:text-foreground">
        <section className="card-surface p-6 md:p-8">
          <p>
            Competitive exam preparation can feel endless when every subject looks equally urgent. A
            better starting point is the notice for the exact post or examination you plan to sit. It
            tells you what is assessed; your routine then turns that outline into small, reviewable
            tasks. The steps below are a study method, not an official syllabus or a promise about any
            commission’s paper pattern.
          </p>
          <p className="mt-4">
            Check current eligibility, dates, rules and syllabus on the official source before you
            plan. Useful starting points include the <a className="text-primary underline" href="https://www.ppsc.gop.pk/" target="_blank" rel="noreferrer">Punjab Public Service Commission</a>, the <a className="text-primary underline" href="https://www.fpsc.gov.pk/" target="_blank" rel="noreferrer">Federal Public Service Commission</a> and <a className="text-primary underline" href="https://www.nts.org.pk/" target="_blank" rel="noreferrer">National Testing Service</a>. Requirements can differ between posts and change over time.
          </p>
        </section>

        <section className="space-y-4" aria-labelledby="map-syllabus">
          <div className="flex items-center gap-3"><BookOpenCheck className="h-6 w-6 text-primary" /><h2 id="map-syllabus">1. Turn the syllabus into a short checklist</h2></div>
          <p>
            Copy the headings from the current official syllabus into a checklist. Split broad headings
            into topics you can finish in one sitting. Mark each topic as <strong>not started</strong>,
            <strong> learning</strong> or <strong>ready for review</strong>. This makes gaps visible and
            stops a large subject name from becoming an unhelpful daily task.
          </p>
          <p>
            Give more time to topics that are both relevant to the exam and difficult for you. Do not
            rely on a generic “important topics” list when the official notice gives a different scope.
            If the syllabus is not specific, use a standard textbook or primary source to define the
            boundaries of your revision.
          </p>
        </section>

        <section className="space-y-4" aria-labelledby="active-recall">
          <div className="flex items-center gap-3"><RotateCcw className="h-6 w-6 text-primary" /><h2 id="active-recall">2. Recall first; reread after</h2></div>
          <p>
            Before opening your notes, try to write or say what you remember about the topic. Then check
            the source and fill the gaps. This makes revision an attempt to retrieve information instead
            of another pass over familiar-looking pages. Keep each session focused on a small set of
            concepts, and return to difficult material after a short interval.
          </p>
          <p>
            A simple 30-minute session might be: five minutes recalling the last topic, fifteen minutes
            learning one syllabus item, and ten minutes answering questions and reviewing why each
            distractor is wrong. Adjust the timing to your schedule; consistency matters more than
            copying someone else’s timetable.
          </p>
        </section>

        <section className="space-y-4" aria-labelledby="use-mcqs">
          <div className="flex items-center gap-3"><CheckCircle2 className="h-6 w-6 text-primary" /><h2 id="use-mcqs">3. Use MCQs to find gaps, not just to collect a score</h2></div>
          <p>
            Answer each question before revealing the explanation. If you guessed correctly, mark it for
            review: a lucky answer is not the same as secure knowledge. Read the explanation, then
            explain the answer in your own words. If the explanation is unclear or seems incorrect, do
            not memorise it uncritically; check a reliable source and revisit the point later.
          </p>
          <p>For each mistake, write down one cause:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li><strong>Knowledge gap:</strong> I did not know the fact or concept.</li>
            <li><strong>Reading error:</strong> I missed a qualifier such as “not”, “first” or “most”.</li>
            <li><strong>Confusion:</strong> I mixed up two similar terms, dates or people.</li>
            <li><strong>Unsupported guess:</strong> I chose without being able to explain why.</li>
          </ul>
          <p>
            Review this error log every few days. Spend revision time on repeated errors, then answer a
            fresh set to see whether the correction holds. Avoid repeating the same memorised questions
  without checking whether you can explain the underlying idea.
          </p>
        </section>

        <section className="space-y-4" aria-labelledby="current-facts">
          <div className="flex items-center gap-3"><ExternalLink className="h-6 w-6 text-primary" /><h2 id="current-facts">4. Verify facts that can change</h2></div>
          <p>
            Office holders, statistics, policies, test dates and current-affairs answers can become
            outdated. Check them against a primary or official source close to your revision date. Keep
            a short note of the source and when you checked it. Treat third-party preparation pages as
            revision aids, not as the final authority for application or examination decisions.
          </p>
          <p>
            For stable subjects such as basic mathematics or grammar, check the reasoning against a
            reliable textbook or reference. For a question about a law, official rule or public notice,
            use the original document where possible and pay attention to amendments and publication
            dates.
          </p>
        </section>

        <section className="space-y-4" aria-labelledby="weekly-plan">
          <div className="flex items-center gap-3"><CalendarDays className="h-6 w-6 text-primary" /><h2 id="weekly-plan">5. Build a weekly rhythm</h2></div>
          <p>
            Use a repeatable week rather than trying to study every subject every day. For example, set
            several days for new topics, one day for mixed recall, and one lighter session to review
            mistakes and plan the next week. If the exam is approaching, add timed practice that matches
            the current official format. Leave room for rest and catch-up; a missed session should not
            force you to abandon the plan.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Plan", "Choose a small set of syllabus items and decide what “done” means for each."],
              ["Learn", "Use a reliable source to understand the concept before drilling questions."],
              ["Practise", "Answer without notes and mark uncertain answers, even when they are correct."],
              ["Review", "Correct the error log, revisit weak items and update facts that may have changed."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl border border-border bg-card p-4">
                <h3>{title}</h3><p className="mt-1 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-primary-soft p-6 md:p-8">
          <h2>Put the method into practice</h2>
          <p className="mt-3">
            Start with a subject that has published questions, answer a short set, and review both your
            mistakes and guesses. Ilmivora is an independent educational resource and is not an official
            source for exam notices or results.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild><Link to="/subjects">Browse available subjects <ArrowRight /></Link></Button>
            <Button asChild variant="outline"><Link to="/practice">Start a practice test</Link></Button>
          </div>
        </section>
      </article>
    </>
  );
}
