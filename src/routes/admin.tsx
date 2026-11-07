import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  LayoutGrid,
  LogOut,
  PlusCircle,
  ShieldAlert,
  Trash2,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AdminCsvUpload } from "@/components/admin/AdminCsvUpload";
import { AdminAddMcq, AdminDeleteBySubject } from "@/components/admin/AdminExtraPanels";
import { AdminMcqs } from "@/components/admin/AdminMcqs";
import { AdminPastPapers } from "@/components/admin/AdminPastPapers";
import { AdminAnalytics, AdminOverview, AdminSubjects } from "@/components/admin/AdminPanels";
import { AdminSubjectIntros } from "@/components/admin/AdminSubjectIntros";
import { AdminSubmissions } from "@/components/admin/AdminSubmissions";
import { Button } from "@/components/ui/button";
import { submissionCountsQuery } from "@/lib/data/queries";
import { getCurrentAuthUser, isCurrentUserAdmin, isPreviewMode, signOut } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "mcqs", label: "Manage MCQs", icon: BookOpen },
  { id: "add", label: "Add MCQ", icon: PlusCircle },
  { id: "submissions", label: "Review Submissions", icon: ClipboardCheck },
  { id: "csv", label: "CSV Upload", icon: Upload },
  { id: "delete", label: "Delete by Subject", icon: Trash2 },
  { id: "subjects", label: "Subjects", icon: FolderOpen },
  { id: "intros", label: "Subject Intros", icon: ImageIcon },
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
      { name: "description", content: "Manage MCQs, student submissions, subjects and past papers." },
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
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const access = useQuery({
    queryKey: ["auth", "admin"],
    queryFn: isCurrentUserAdmin,
    enabled: !isPreviewMode,
    retry: false,
  });
  const isAdmin = isPreviewMode || (hydrated && access.data === true);
  const pending = useQuery({ ...submissionCountsQuery(), enabled: isAdmin }).data?.pending ?? 0;
  const active = SECTIONS.find((s) => s.id === tab) ?? SECTIONS[0];

  const go = (id: SectionId) => navigate({ search: { tab: id === "overview" ? undefined : id } });

  if (!isPreviewMode && (!hydrated || access.isPending || access.data !== true)) {
    const user = getCurrentAuthUser();
    return (
      <div className="container-page py-16">
        <section className="card-surface mx-auto max-w-xl space-y-4 p-8 text-center">
          <ShieldAlert className="mx-auto h-9 w-9 text-warning" />
          <h1 className="text-2xl font-bold">Admin access required</h1>
          <p className="text-muted-foreground">
            {!hydrated || access.isPending
              ? "Checking your account…"
              : user
                ? "This account is not on Ilmivora’s admin list."
                : "Log in with an Ilmivora admin account to manage content."}
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild><Link to="/login">Log in</Link></Button>
            {hydrated && user && (
              <Button variant="outline" onClick={() => { signOut(); void navigate({ to: "/login" }); }}>
                Sign out
              </Button>
            )}
          </div>
        </section>
      </div>
    );
  }

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

        <section className="min-w-0" aria-labelledby="admin-section-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">Admin</p>
              <h1 id="admin-section-title" className="mt-1 text-3xl font-bold md:text-4xl">{active.label}</h1>
            </div>
            {!isPreviewMode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  signOut();
                  queryClient.clear();
                  void navigate({ to: "/login" });
                }}
              >
                <LogOut aria-hidden="true" />
                Log out
              </Button>
            )}
          </div>

          <div className={cn("mt-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm", isPreviewMode ? "border-warning/40 bg-warning-soft" : "border-success/40 bg-success-soft")}>
            <ShieldAlert className={cn("mt-0.5 h-4 w-4 shrink-0", isPreviewMode ? "text-warning" : "text-success")} />
            <p className="text-foreground">
              {isPreviewMode
                ? "Preview mode — changes here are not saved yet."
                : "Connected to Ilmivora. Database changes are limited to admin accounts."}
            </p>
          </div>

          <div className="mt-6">
            {active.id === "overview" && <AdminOverview />}
            {active.id === "mcqs" && <AdminMcqs />}
            {active.id === "add" && <AdminAddMcq />}
            {active.id === "submissions" && <AdminSubmissions />}
            {active.id === "csv" && <AdminCsvUpload />}
            {active.id === "delete" && <AdminDeleteBySubject />}
            {active.id === "subjects" && <AdminSubjects />}
            {active.id === "intros" && <AdminSubjectIntros />}
            {active.id === "papers" && <AdminPastPapers />}
            {active.id === "analytics" && <AdminAnalytics />}
          </div>
        </section>
      </div>
    </div>
  );
}
