import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { CategoryLink } from "@/components/site/CategoryLink";
import { McqBrowser } from "@/components/mcq/McqBrowser";
import { SectionGrid } from "@/components/mcq/SectionGrid";
import { getCategoryBySlug, getChildren, getPath } from "@/lib/categories";

type Search = { page?: number | undefined; q?: string | undefined };

export const Route = createFileRoute("/subjects/$slug")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    page: Number(s["page"]) > 1 ? Math.floor(Number(s["page"])) : undefined,
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
  }),
  loader: ({ params }) => {
    const cat = getCategoryBySlug(params.slug);
    if (!cat) throw notFound();
    const path = getPath(cat);
    return {
      name: cat.name,
      domain: cat.domain,
      isSubject: !cat.parent,
      rootName: path[0]!.name,
      path: path.map((p) => ({ name: p.name, slug: p.slug, parent: p.parent })),
    };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name;
    if (!name) return { meta: [{ title: "Subject unavailable — Ilmivora" }, { name: "robots", content: "noindex" }] };
    const context = loaderData.isSubject ? "" : ` (${loaderData.rootName})`;
    return {
      meta: [
        { title: `${name}${context} MCQs — Ilmivora` },
        {
          name: "description",
          content: `Practise ${name}${context} MCQs with answers and explanations for PPSC, FPSC and NTS exams.`,
        },
        { property: "og:title", content: `${name} MCQs — Ilmivora` },
        { property: "og:description", content: `${name}${context} MCQs with explanations.` },
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
  const { name, domain, isSubject, rootName, path } = Route.useLoaderData();
  const { page = 1, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const sections = getChildren(name);
  const practiceSearch = isSubject ? { subject: name } : { subject: rootName, topic: name };

  return (
    <>
      <PageHeader
        eyebrow={isSubject ? domain : `${rootName} · Section`}
        title={`${name} MCQs`}
        description={
          sections.length > 0
            ? `${sections.length} sections below. Every question comes with the correct answer and an explanation.`
            : "Every question comes with the correct answer and a short explanation."
        }
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" asChild>
            <Link to="/practice" search={practiceSearch}>
              <Target /> Practice {name}
            </Link>
          </Button>
          <Button variant="hero-outline" asChild>
            <Link to="/exam" search={practiceSearch}>
              <Clock /> Exam mode
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="container-page py-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Link to="/subjects" className="hover:text-foreground">
            Subjects
          </Link>
          {path.map((p, i) => (
            <span key={p.slug} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5" />
              {i === path.length - 1 ? (
                <span className="font-medium text-foreground">{p.name}</span>
              ) : (
                <CategoryLink cat={p} className="hover:text-foreground">
                  {p.name}
                </CategoryLink>
              )}
            </span>
          ))}
        </nav>

        {sections.length > 0 && (
          <div className="mt-8">
            <SectionGrid sections={sections} />
          </div>
        )}

        <section className="mx-auto mt-12 max-w-4xl">
          <h2 className="mb-5 text-2xl font-bold">{sections.length > 0 ? `All ${name} MCQs` : "MCQs"}</h2>
          <McqBrowser
            filters={isSubject ? { subject: name } : { topic: name }}
            page={page}
            search={q}
            onPageChange={(p) => navigate({ search: (s) => ({ ...s, page: p > 1 ? p : undefined }) })}
            onSearchChange={(v) => navigate({ search: { q: v } })}
            emptyMessage={`No ${name} MCQs have been added yet.`}
          />
        </section>
      </div>
    </>
  );
}
