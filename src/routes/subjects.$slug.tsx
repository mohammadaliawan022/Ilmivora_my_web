import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { McqBrowser } from "@/components/mcq/McqBrowser";
import { getSubjectBySlug } from "@/lib/subjects";

type Search = { page?: number | undefined; q?: string | undefined };

export const Route = createFileRoute("/subjects/$slug")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    page: Number(s["page"]) > 1 ? Math.floor(Number(s["page"])) : undefined,
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
  }),
  loader: ({ params }) => {
    const subject = getSubjectBySlug(params.slug);
    if (!subject) throw notFound();
    return { name: subject.name };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name ?? "Subject";
    return {
      meta: [
        { title: `${name} MCQs — Ilmivora` },
        {
          name: "description",
          content: `Practise ${name} MCQs with answers and explanations for PPSC, FPSC and NTS exams.`,
        },
        { property: "og:title", content: `${name} MCQs — Ilmivora` },
        { property: "og:description", content: `${name} MCQs with explanations.` },
      ],
    };
  },
  component: SubjectPage,
});

function SubjectPage() {
  const { name } = Route.useLoaderData();
  const { page = 1, q } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <PageHeader
        eyebrow="Subject"
        title={`${name} MCQs`}
        description="Every question comes with the correct answer and a short explanation."
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" asChild>
            <Link to="/practice" search={{ subject: name }}>
              <Target /> Practice {name}
            </Link>
          </Button>
          <Button variant="hero-outline" asChild>
            <Link to="/exam" search={{ subject: name }}>
              <Clock /> Exam mode
            </Link>
          </Button>
        </div>
      </PageHeader>
      <div className="container-page max-w-4xl py-10">
        <McqBrowser
          filters={{ subject: name }}
          page={page}
          search={q}
          onPageChange={(p) => navigate({ search: (s) => ({ ...s, page: p > 1 ? p : undefined }) })}
          onSearchChange={(v) => navigate({ search: { q: v } })}
          emptyMessage={`No ${name} MCQs have been added yet.`}
        />
      </div>
    </>
  );
}
