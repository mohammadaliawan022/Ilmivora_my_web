import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, ClipboardList, Info, Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { loadAttempts, summarizeAttempts, type TestAttempt } from "@/shared/attempts";
import { cn } from "@/shared/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — Ilmivora" },
      {
        name: "description",
        content: "Track tests attempted, average score, recent results and subject-wise performance.",
      },
      { property: "og:title", content: "My Dashboard — Ilmivora" },
      { property: "og:description", content: "Your exam preparation progress at a glance." },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [attempts, setAttempts] = useState<TestAttempt[] | null>(null);
  useEffect(() => setAttempts(loadAttempts()), []);

  if (attempts === null) {
    return (
      <div className="container-page min-h-[60vh] py-10" aria-busy="true" aria-label="Loading your progress">
        <Skeleton className="h-10 w-56" />
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)}
        </div>
        <p className="sr-only">Loading your progress…</p>
      </div>
    );
  }

  const summary = summarizeAttempts(attempts);
  const best = attempts.reduce((m, a) => Math.max(m, a.percentage), 0);
  const trend = [...attempts]
    .slice(0, 15)
    .reverse()
    .map((a, i) => ({ n: i + 1, score: a.percentage, label: format(new Date(a.createdAt), "d MMM") }));

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet">Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">Your progress</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/practice">
              <Target /> Practice
            </Link>
          </Button>
          <Button asChild>
            <Link to="/exam">Take an exam</Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-primary-soft px-4 py-3 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-accent-foreground">
          Results are stored in this browser on this device. They are not linked to your Ilmivora account.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Tests attempted" value={summary.totalTests} />
        <StatCard icon={BarChart3} label="Average score" value={`${summary.averageScore}%`} />
        <StatCard icon={Target} label="Questions answered" value={summary.totalQuestions} />
        <StatCard icon={Trophy} label="Best score" value={`${best}%`} />
      </div>

      {attempts.length === 0 ? (
        <div className="card-surface mt-8 flex flex-col items-center gap-3 p-12 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-semibold">No tests yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Complete a practice test or exam and your results will show up here.
          </p>
          <Button asChild className="mt-2">
            <Link to="/practice">Start your first test</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <section className="card-surface p-6">
            <h2 className="text-lg font-bold">Progress over time</h2>
            <p className="text-sm text-muted-foreground">Score on your last {trend.length} tests</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }}
                    formatter={(v: number) => [`${v}%`, "Score"]}
                  />
                  <Area type="monotone" dataKey="score" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#scoreFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card-surface p-6">
            <h2 className="text-lg font-bold">Subject-wise performance</h2>
            <ul className="mt-5 space-y-4">
              {summary.bySubject.slice(0, 8).map((s) => (
                <li key={s.subject}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">{s.subject}</span>
                    <span className="text-muted-foreground">
                      {s.average}% · {s.tests} test{s.tests === 1 ? "" : "s"}
                    </span>
                  </div>
                  <Progress value={s.average} className="h-2" />
                </li>
              ))}
            </ul>
          </section>

          <section className="card-surface overflow-hidden lg:col-span-2">
            <h2 className="px-6 pt-6 text-lg font-bold">Recent tests</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Subject</th>
                    <th className="px-6 py-3 font-semibold">Mode</th>
                    <th className="px-6 py-3 font-semibold">Correct</th>
                    <th className="px-6 py-3 font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attempts.slice(0, 10).map((a) => (
                    <tr key={a.id}>
                      <td className="whitespace-nowrap px-6 py-3 text-muted-foreground">
                        {format(new Date(a.createdAt), "d MMM yyyy, h:mm a")}
                      </td>
                      <td className="px-6 py-3 font-medium">{a.subject}</td>
                      <td className="px-6 py-3">
                        <Badge variant={a.mode === "exam" ? "violet" : "soft"}>
                          {a.mode === "exam" ? "Exam" : "Practice"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        {a.correct}/{a.total}
                      </td>
                      <td
                        className={cn(
                          "px-6 py-3 font-display font-bold",
                          a.percentage >= 70 ? "text-success" : a.percentage >= 40 ? "text-warning" : "text-danger",
                        )}
                      >
                        {a.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
}) {
  return (
    <div className="card-surface p-5">
      <Icon className="h-5 w-5 text-violet" />
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
