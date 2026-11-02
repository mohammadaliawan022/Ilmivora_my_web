import { useQuery } from "@tanstack/react-query";
import { BookMarked, FileText, FolderTree, Layers, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { examCountsQuery, mcqListQuery, subjectCountsQuery } from "@/lib/data/queries";
import { loadAttempts, summarizeAttempts, type TestAttempt } from "@/lib/attempts";
import { EXAM_CATEGORIES } from "@/lib/exam-categories";
import { GK_CATEGORY_TARGET_COUNT } from "@/lib/gk-categories";
import { SUBJECTS } from "@/lib/subjects";

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const tooltipStyle = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 };
const tick = { fontSize: 11, fill: "var(--muted-foreground)" };

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number }) {
  return (
    <div className="card-surface p-5">
      <Icon className="h-5 w-5 text-violet" />
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function AdminOverview({ gkCount, paperCount }: { gkCount: number; paperCount: number }) {
  const total = useQuery(mcqListQuery({}, 1, 1));
  const subjectCounts = useQuery(subjectCountsQuery());
  const examCounts = useQuery(examCountsQuery());

  const bySubject = Object.entries(subjectCounts.data ?? {})
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const byExam = Object.entries(examCounts.data ?? {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={BookMarked} label="Total MCQs" value={total.data?.total.toLocaleString() ?? "—"} />
        <Stat icon={Layers} label="Subjects" value={SUBJECTS.length} />
        <Stat icon={FolderTree} label="GK categories" value={`${gkCount}/${GK_CATEGORY_TARGET_COUNT}`} />
        <Stat icon={FileText} label="Past papers" value={paperCount} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="card-surface p-6">
          <h3 className="font-bold">MCQs by subject (top 10)</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySubject} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={tick} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={tick} width={110} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card-surface p-6">
          <h3 className="font-bold">MCQs by exam category</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byExam} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                  {byExam.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 flex flex-wrap gap-3 text-xs">
            {byExam.map((e, i) => (
              <li key={e.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {e.name} ({e.value})
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export function AdminSubjects() {
  const { data } = useQuery(subjectCountsQuery());
  return (
    <div className="card-surface overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Subject</th>
            <th className="px-4 py-3 font-semibold">Group</th>
            <th className="px-4 py-3 text-right font-semibold">MCQs</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {SUBJECTS.map((s) => (
            <tr key={s.slug}>
              <td className="px-4 py-3 font-medium">
                <span className="flex items-center gap-2">
                  <s.icon className="h-4 w-4 text-primary" /> {s.name}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{s.group}</td>
              <td className="px-4 py-3 text-right font-semibold">{(data?.[s.name] ?? 0).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminGkCategories({
  categories,
  onChange,
}: {
  categories: string[];
  onChange: (next: string[]) => void;
}) {
  const [name, setName] = useState("");
  const add = (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    if (categories.some((c) => c.toLowerCase() === n.toLowerCase())) {
      toast.error("That category already exists");
      return;
    }
    onChange([...categories, n]);
    setName("");
  };
  return (
    <div className="space-y-5">
      <div className="card-surface p-6">
        <h3 className="text-lg font-bold">General Knowledge categories</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {categories.length} of {GK_CATEGORY_TARGET_COUNT} added. Names must match the MCQ{" "}
          <code className="text-foreground">topic</code> value exactly.
        </p>
        <form onSubmit={add} className="mt-4 flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" aria-label="Category name" />
          <Button type="submit">
            <Plus /> Add
          </Button>
        </form>
      </div>
      {categories.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <li key={c} className="card-surface flex items-center justify-between px-4 py-2.5 text-sm font-medium">
              {c}
              <Button variant="ghost" size="icon" aria-label={`Remove ${c}`} onClick={() => onChange(categories.filter((x) => x !== c))}>
                <Trash2 className="text-danger" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export interface PastPaper {
  id: string;
  title: string;
  exam: string;
  year: number;
  url: string;
}

export function AdminPastPapers({
  papers,
  onChange,
}: {
  papers: PastPaper[];
  onChange: (next: PastPaper[]) => void;
}) {
  const [title, setTitle] = useState("");
  const [exam, setExam] = useState(EXAM_CATEGORIES[0]!.code);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [url, setUrl] = useState("");

  const add = (e: FormEvent) => {
    e.preventDefault();
    onChange([{ id: crypto.randomUUID(), title: title.trim(), exam, year: Number(year), url: url.trim() }, ...papers]);
    setTitle("");
    setUrl("");
    toast.success("Past paper added");
  };

  return (
    <div className="space-y-5">
      <form onSubmit={add} className="card-surface grid gap-3 p-6 md:grid-cols-[2fr_1fr_1fr_2fr_auto] md:items-end">
        <label className="space-y-1.5 text-sm font-medium">
          Title
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lecturer English 2024" />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Exam
          <select
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {EXAM_CATEGORIES.map((c) => (
              <option key={c.code}>{c.code}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Year
          <Input required type="number" min={1990} max={2100} value={year} onChange={(e) => setYear(e.target.value)} />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          File link
          <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
        </label>
        <Button type="submit">
          <Plus /> Add
        </Button>
      </form>
      {papers.length === 0 ? (
        <p className="card-surface p-8 text-center text-sm text-muted-foreground">No past papers added yet.</p>
      ) : (
        <ul className="space-y-2">
          {papers.map((p) => (
            <li key={p.id} className="card-surface flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span>
                <span className="font-semibold">{p.title}</span>{" "}
                <span className="text-muted-foreground">· {p.exam} · {p.year}</span>
              </span>
              <Button variant="ghost" size="icon" aria-label={`Remove ${p.title}`} onClick={() => onChange(papers.filter((x) => x.id !== p.id))}>
                <Trash2 className="text-danger" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminAnalytics() {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  useEffect(() => setAttempts(loadAttempts()), []);
  const s = summarizeAttempts(attempts);
  const modeData = [
    { name: "Practice", value: attempts.filter((a) => a.mode === "practice").length },
    { name: "Exam", value: attempts.filter((a) => a.mode === "exam").length },
  ];
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Showing tests taken on this device. Site-wide analytics appear once accounts are connected.
      </p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Users} label="Tests taken" value={s.totalTests} />
        <Stat icon={BookMarked} label="Questions answered" value={s.totalQuestions} />
        <Stat icon={Layers} label="Average score" value={`${s.averageScore}%`} />
        <Stat icon={FileText} label="Exam-mode tests" value={modeData[1]?.value ?? 0} />
      </div>
      <section className="card-surface p-6">
        <h3 className="font-bold">Average score by subject</h3>
        {s.bySubject.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No test data yet.</p>
        ) : (
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={s.bySubject}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="subject" tick={tick} />
                <YAxis domain={[0, 100]} tick={tick} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="average" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
