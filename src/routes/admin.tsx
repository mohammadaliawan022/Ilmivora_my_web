import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileText,
  FolderOpen,
  FolderTree,
  LayoutGrid,
  PlusCircle,
  ShieldAlert,
  Trash2,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { AdminCsvUpload } from "@/components/admin/AdminCsvUpload";
import { AdminAddMcq, AdminDeleteBySubject } from "@/components/admin/AdminExtraPanels";
import { AdminMcqs } from "@/components/admin/AdminMcqs";
import {
  AdminAnalytics,
  AdminGkCategories,
  AdminOverview,
  AdminPastPapers,
  AdminSubjects,
  type PastPaper,
} from "@/components/admin/AdminPanels";
import { AdminSubmissions } from "@/components/admin/AdminSubmissions";
import { submissionCountsQuery } from "@/lib/data/queries";
import { GK_CATEGORY_NAMES } from "@/lib/gk-categories";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "mcqs", label: "Manage MCQs", icon: BookOpen },
  { id: "add", label: "Add MCQ", icon: PlusCircle },
  { id: "submissions", label: "Review Submissions", icon: ClipboardCheck },
  { id: "csv", label: "CSV Upload", icon: Upload },
  { id: "delete", label: "Delete by Subject", icon: Trash2 },
  { id: "subjects", label: "Subjects", icon: FolderOpen },
  { id: "gk", label: "GK Categories", icon: FolderTree },
  { id: "papers", label: "Past Papers", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
] as const satisfies ReadonlyArray<{ id: string; label: string; icon: LucideIcon }>;

type SectionId = (typeof SECTIONS)[number]["id"];
const IDS = SECTIONS.map((s) => s.id) as readonly string[];

export const Route = createFileRoute("/admin")({
  validateSearch: (s: Record<string, unknown>): { tab?: SectionId | undefined } => ({
    tab: IDS.includes(s["tab"] as string) && s["tab"] !== "overview" ? (s["tab"] as SectionId) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Ilmivora" },
      { name: "description", content: "Manage MCQs, student submissions, subjects, GK categories and past papers." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin — Ilmivora" },
      { property: "og:description", content: "Ilmivora content management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { tab = "overview" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [gk, setGk] = useState<string[]>(GK_CATEGORY_NAMES);
  const [papers, setPapers] = useState<PastPaper[]>([]);
  const pending = useQuery(submissionCountsQuery()).data?.pending ?? 0;
  const active = SECTIONS.find((s) => s.id === tab) ?? SECTIONS[0];

  const go = (id: SectionId) => navigate({ search: { tab: id === "overview" ? undefined : id } });

  return (
    <div className="container-page py-8 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[250px_1fr] lg:gap-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav
            aria-label="Admin"
            className="rounded-2xl bg-sidebar p-2 text-sidebar-foreground shadow-card lg:p-3"
          >
            <p className="hidden px-3 pb-3 pt-2 font-display text-lg font-bold lg:block">Ilmivora Admin</p>
            <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
              {SECTIONS.map((s) => {
                const isActive = s.id === active.id;
                return (
                  <li key={s.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => go(s.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors lg:py-3",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <s.icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="flex-1 text-left">{s.label}</span>
                      {s.id === "submissions" && pending > 0 && (
                        <span className="rounded-full bg-violet px-2 py-0.5 text-xs font-bold text-violet-foreground">
                          {pending}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">Admin</p>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">{active.label}</h1>

          <div className="mt-5 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning-soft px-4 py-3 text-sm">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-foreground">
              Preview mode — changes here are not saved yet. Once sign-in is connected, this area will be
              locked to admin accounts only and every change will be checked on the server.
            </p>
          </div>

          <div className="mt-6">
            {active.id === "overview" && <AdminOverview gkCount={gk.length} paperCount={papers.length} />}
            {active.id === "mcqs" && <AdminMcqs gkCategories={gk} />}
            {active.id === "add" && <AdminAddMcq gkCategories={gk} />}
            {active.id === "submissions" && <AdminSubmissions gkCategories={gk} />}
            {active.id === "csv" && <AdminCsvUpload />}
            {active.id === "delete" && <AdminDeleteBySubject />}
            {active.id === "subjects" && <AdminSubjects />}
            {active.id === "gk" && <AdminGkCategories categories={gk} onChange={setGk} />}
            {active.id === "papers" && <AdminPastPapers papers={papers} onChange={setPapers} />}
            {active.id === "analytics" && <AdminAnalytics />}
          </div>
        </main>
      </div>
    </div>
  );
}
