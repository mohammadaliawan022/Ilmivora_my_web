import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminCsvUpload } from "@/components/admin/AdminCsvUpload";
import { AdminMcqs } from "@/components/admin/AdminMcqs";
import {
  AdminAnalytics,
  AdminGkCategories,
  AdminOverview,
  AdminPastPapers,
  AdminSubjects,
  type PastPaper,
} from "@/components/admin/AdminPanels";
import { GK_CATEGORY_NAMES } from "@/lib/gk-categories";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Ilmivora" },
      { name: "description", content: "Manage MCQs, subjects, GK categories and past papers." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin — Ilmivora" },
      { property: "og:description", content: "Ilmivora content management." },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  ["overview", "Overview"],
  ["mcqs", "MCQs"],
  ["csv", "Bulk upload"],
  ["subjects", "Subjects"],
  ["gk", "GK categories"],
  ["papers", "Past papers"],
  ["analytics", "Analytics"],
] as const;

function AdminPage() {
  const [gk, setGk] = useState<string[]>(GK_CATEGORY_NAMES);
  const [papers, setPapers] = useState<PastPaper[]>([]);

  return (
    <div className="container-page py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">Admin</p>
      <h1 className="mt-1 text-3xl font-bold md:text-4xl">Content management</h1>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning-soft px-4 py-3 text-sm">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <p className="text-foreground">
          Preview mode — changes here are not saved yet. Once sign-in is connected, this area will be
          locked to admin accounts only and every change will be checked on the server.
        </p>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-muted p-1">
          {TABS.map(([v, l]) => (
            <TabsTrigger key={v} value={v}>
              {l}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <AdminOverview gkCount={gk.length} paperCount={papers.length} />
        </TabsContent>
        <TabsContent value="mcqs" className="mt-6">
          <AdminMcqs gkCategories={gk} />
        </TabsContent>
        <TabsContent value="csv" className="mt-6">
          <AdminCsvUpload />
        </TabsContent>
        <TabsContent value="subjects" className="mt-6">
          <AdminSubjects />
        </TabsContent>
        <TabsContent value="gk" className="mt-6">
          <AdminGkCategories categories={gk} onChange={setGk} />
        </TabsContent>
        <TabsContent value="papers" className="mt-6">
          <AdminPastPapers papers={papers} onChange={setPapers} />
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <AdminAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
