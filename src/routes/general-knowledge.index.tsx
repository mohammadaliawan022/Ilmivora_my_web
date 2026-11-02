import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, FolderOpen, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { McqBrowser } from "@/components/mcq/McqBrowser";
import { GK_CATEGORY_TARGET_COUNT, getGkCategories } from "@/lib/gk-categories";
import { GK_SUBJECT } from "@/lib/subjects";

type Search = { page?: number | undefined; q?: string };

export const Route = createFileRoute("/general-knowledge/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    page: Number(s["page"]) > 1 ? Math.floor(Number(s["page"])) : undefined,
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "General Knowledge MCQs by Topic — Ilmivora" },
      {
        name: "description",
        content:
          "Browse General Knowledge MCQs by topic category for PPSC, FPSC and NTS, each with answers and explanations.",
      },
      { property: "og:title", content: "General Knowledge MCQs — Ilmivora" },
      { property: "og:description", content: "GK MCQs organised by topic category." },
    ],
  }),
  component: GkPage,
});

function GkPage() {
  const { page = 1, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const categories = getGkCategories();

  return (
    <>
      <PageHeader
        eyebrow="General Knowledge"
        title="General Knowledge MCQs"
        description="Pick a topic to focus your preparation, or work through every GK question."
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" asChild>
            <Link to="/practice" search={{ subject: GK_SUBJECT }}>
              <Target /> Practice GK
            </Link>
          </Button>
          <Button variant="hero-outline" asChild>
            <Link to="/exam" search={{ subject: GK_SUBJECT }}>
              <Clock /> GK exam
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="container-page py-10">
        <section>
          <h2 className="text-2xl font-bold">Topic categories</h2>
          {categories.length === 0 ? (
            <div className="card-surface mt-5 flex flex-col items-center gap-3 p-10 text-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
              <p className="font-semibold">Topic categories are on their way</p>
              <p className="max-w-md text-sm text-muted-foreground">
                The {GK_CATEGORY_TARGET_COUNT} General Knowledge topics will appear here once they're
                added. Until then, all GK MCQs are listed below.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  to="/general-knowledge/$topic"
                  params={{ topic: c.slug }}
                  className="card-surface card-interactive px-4 py-3.5 font-medium"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto mt-14 max-w-4xl">
          <h2 className="mb-5 text-2xl font-bold">All GK MCQs</h2>
          <McqBrowser
            filters={{ subject: GK_SUBJECT }}
            page={page}
            search={q}
            onPageChange={(p) => navigate({ search: (s) => ({ ...s, page: p > 1 ? p : undefined }) })}
            onSearchChange={(v) => navigate({ search: { q: v } })}
            emptyMessage="No General Knowledge MCQs have been added yet."
          />
        </section>
      </div>
    </>
  );
}
