import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubjectIntro } from "@/components/site/SubjectIntro";
import { McqBrowser } from "@/components/mcq/McqBrowser";
import { SubjectQuizSidebar } from "@/components/mcq/SubjectQuizSidebar";
import { getCategoryBySlug } from "@/lib/categories";

type Search = { page?: number | undefined; q?: string | undefined };

export const Route = createFileRoute("/subjects/$slug")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    page: Number(s["page"]) > 1 ? Math.floor(Number(s["page"])) : undefined,
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
  }),
  loader: ({ params }) => {
    const cat = getCategoryBySlug(params.slug);
    if (!cat || cat.parent) throw notFound();
    return { name: cat.name };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name;
    if (!name) return { meta: [{ title: "Subject unavailable — Ilmivora" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `${name} MCQs — Ilmivora` },
        {
          name: "description",
          content: `Practise ${name} MCQs with answers and explanations for PPSC, FPSC and NTS exams.`,
        },
        { property: "og:title", content: `${name} MCQs — Ilmivora` },
        { property: "og:description", content: `${name} MCQs with explanations.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-20 text-center">
      <h1 className="text-2xl font-bold">Subject not found</h1>
      <Button asChild className="mt-6">
        <Link to="/subjects">Browse all subjects</Link>
      </Button>
    </div>
  ),
  component: SubjectPage,
});

function SubjectPage() {
  const { name } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { page = 1, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const filters = { subject: name };

  return (
    <>
      <section className="relative overflow-hidden bg-hero text-navy-foreground">
        <div className="pointer-events-none absolute inset-0 grid-pattern" aria-hidden />
        <div className="container-page relative py-12 text-center md:py-16">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet/70 bg-violet/25 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            <BookOpen className="h-4 w-4" aria-hidden="true" /> MCQ Practice
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight md:text-5xl">
            {name} <span className="bg-gradient-to-r from-blue-400 via-violet to-purple-500 bg-clip-text text-transparent">MCQs</span>
          </h1>
          <p className="mt-3 text-sm text-navy-foreground/75 md:text-base">Learn Smarter. Achieve More.</p>
        </div>
      </section>

      <div className="container-page py-8 md:py-10">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Link to="/subjects" className="font-semibold text-primary hover:underline">All Subjects</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-medium text-foreground">{name}</span>
        </nav>

        <SubjectIntro slug={slug} name={name} />

        <div className="mt-7 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-xl bg-primary-soft px-4 py-3 font-semibold text-primary">All MCQs</span>
          <span className="text-muted-foreground">All {name} questions</span>
        </div>

        <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0" aria-labelledby="subject-questions-heading">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h2 id="subject-questions-heading" className="text-xl font-bold md:text-2xl">{name} Questions</h2>
            </div>
            <McqBrowser
              filters={filters}
              page={page}
              search={q}
              onPageChange={(p) => navigate({ search: (s) => ({ ...s, page: p > 1 ? p : undefined }) })}
              onSearchChange={(v) => navigate({ search: { q: v }, resetScroll: false })}
              emptyMessage={`No ${name} MCQs have been added yet.`}
            />
          </section>
          <SubjectQuizSidebar filters={filters} subject={name} page={page} />
        </div>
        <p className="mt-8 text-center text-sm">
          <Link to="/submit-mcq" className="font-semibold text-primary hover:underline">Have a useful question? Submit an MCQ</Link>
        </p>
      </div>
    </>
  );
}
