import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { McqBrowser } from "@/components/mcq/McqBrowser";
import { getGkCategoryBySlug } from "@/lib/gk-categories";
import { GK_SUBJECT } from "@/lib/subjects";

type Search = { page?: number | undefined; q?: string };

export const Route = createFileRoute("/general-knowledge/$topic")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    page: Number(s["page"]) > 1 ? Math.floor(Number(s["page"])) : undefined,
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
  }),
  loader: ({ params }) => {
    const cat = getGkCategoryBySlug(params.topic);
    if (!cat) throw notFound();
    return { name: cat.name };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name;
    return {
      meta: name
        ? [
            { title: `${name} — General Knowledge MCQs | Ilmivora` },
            { name: "description", content: `General Knowledge MCQs on ${name} with explanations.` },
            { property: "og:title", content: `${name} GK MCQs — Ilmivora` },
            { property: "og:description", content: `Practise ${name} General Knowledge MCQs.` },
          ]
        : [{ title: "Topic unavailable — Ilmivora" }, { name: "robots", content: "noindex" }],
    };
  },
  component: TopicPage,
});

function TopicPage() {
  const { name } = Route.useLoaderData();
  const { page = 1, q } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <PageHeader eyebrow="General Knowledge · Topic" title={name}>
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" asChild>
            <Link to="/practice" search={{ subject: GK_SUBJECT, topic: name }}>
              <Target /> Practice this topic
            </Link>
          </Button>
          <Button variant="hero-outline" asChild>
            <Link to="/exam" search={{ subject: GK_SUBJECT, topic: name }}>
              <Clock /> Exam mode
            </Link>
          </Button>
        </div>
      </PageHeader>
      <div className="container-page max-w-4xl py-10">
        <Button variant="ghost" size="sm" asChild className="mb-5">
          <Link to="/general-knowledge">
            <ArrowLeft /> All GK topics
          </Link>
        </Button>
        <McqBrowser
          filters={{ subject: GK_SUBJECT, topic: name }}
          page={page}
          search={q}
          onPageChange={(p) => navigate({ search: (s) => ({ ...s, page: p > 1 ? p : undefined }) })}
          onSearchChange={(v) => navigate({ search: { q: v } })}
          emptyMessage={`No MCQs have been tagged “${name}” yet.`}
        />
      </div>
    </>
  );
}
