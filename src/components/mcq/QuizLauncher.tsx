import { useMutation } from "@tanstack/react-query";
import { ChevronDown, Clock, Loader2, Play, Target } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getQuizQuestions } from "@/lib/data/mcq-repo";
import { EXAM_CATEGORIES } from "@/lib/exam-categories";
import { EXAM_SECONDS_PER_QUESTION, type Mcq } from "@/lib/mcq";
import { SUBJECTS } from "@/lib/subjects";
import { ExamQuiz } from "./ExamQuiz";
import { PracticeQuiz } from "./PracticeQuiz";

const ALL = "__all__";
const COUNTS = [5, 10, 20, 30, 50, 100];

export function QuizLauncher({
  mode,
  initialSubject,
  initialTopic,
  initialExam,
}: {
  mode: "practice" | "exam";
  initialSubject?: string | undefined;
  initialTopic?: string | undefined;
  initialExam?: string | undefined;
}) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialSubject ? [initialSubject] : []);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [subjectPickerOpen, setSubjectPickerOpen] = useState(false);
  const [exam, setExam] = useState(initialExam ?? ALL);
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState<Mcq[] | null>(null);

  const start = useMutation({
    mutationFn: () =>
      getQuizQuestions(
        {
          subjects: selectedSubjects.length > 0 ? selectedSubjects : undefined,
          topic: initialTopic,
          examCategory: exam === ALL ? undefined : exam,
        },
        count,
      ),
    onSuccess: (rows) => setQuestions(rows),
  });

  const selectedLabel = selectedSubjects.length === 0
    ? "Mixed subjects"
    : selectedSubjects.length === 1
      ? selectedSubjects[0]!
      : `Mixed: ${selectedSubjects.join(", ")}`;
  const label = initialTopic ?? selectedLabel;
  const reset = () => {
    setQuestions(null);
    start.reset();
  };

  if (questions && questions.length > 0) {
    return mode === "practice" ? (
      <PracticeQuiz mcqs={questions} label={label} topic={initialTopic} onRestart={reset} />
    ) : (
      <ExamQuiz mcqs={questions} label={label} topic={initialTopic} onRestart={reset} />
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card-surface p-6 md:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
            {mode === "practice" ? <Target className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
          </span>
          <div>
            <h2 className="text-xl font-bold">
              {mode === "practice" ? "Set up your practice test" : "Set up your exam"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "practice"
                ? "10 questions per page, with instant feedback and explanations."
                : `${EXAM_SECONDS_PER_QUESTION} seconds per question. Answers revealed at the end.`}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {initialTopic ? (
            <div className="sm:col-span-2">
              <Label>Topic</Label>
              <p className="mt-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium">
                {initialTopic}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:col-span-2">
              <Label id="practice-subject-label">Subjects</Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  aria-labelledby="practice-subject-label"
                  aria-expanded={subjectPickerOpen}
                  aria-controls="practice-subject-options"
                  className="w-full justify-between font-normal"
                  onClick={() => setSubjectPickerOpen((open) => !open)}
                >
                  <span>
                    {selectedSubjects.length === 0
                      ? "All subjects (mixed)"
                      : selectedSubjects.length === 1
                        ? selectedSubjects[0]
                        : `${selectedSubjects.length} subjects selected`}
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${subjectPickerOpen ? "rotate-180" : ""}`} />
                </Button>
                {subjectPickerOpen && (
                  <div id="practice-subject-options" className="absolute left-0 top-full z-30 mt-2 w-full rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-xl">
                  <Input
                    value={subjectSearch}
                    onChange={(event) => setSubjectSearch(event.target.value)}
                    placeholder="Search subjects…"
                    aria-label="Search subjects"
                    className="mb-2"
                  />
                  <div className="max-h-56 space-y-1 overflow-y-auto">
                    <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm font-medium hover:bg-accent">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.length === 0}
                        onChange={() => setSelectedSubjects([])}
                        className="h-4 w-4 accent-primary"
                      />
                      All subjects (mixed)
                    </label>
                    {SUBJECTS.filter((s) => s.name.toLowerCase().includes(subjectSearch.trim().toLowerCase())).map((s) => (
                      <label key={s.slug} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(s.name)}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setSelectedSubjects((current) =>
                              checked
                                ? current.includes(s.name) ? current : [...current, s.name]
                                : current.filter((name) => name !== s.name),
                            );
                          }}
                          className="h-4 w-4 accent-primary"
                        />
                        {s.name}
                      </label>
                    ))}
                    {SUBJECTS.every((s) => !s.name.toLowerCase().includes(subjectSearch.trim().toLowerCase())) && (
                      <p className="px-2 py-3 text-center text-sm text-muted-foreground">No subjects found.</p>
                    )}
                  </div>
                  <div className="mt-3 border-t border-border pt-2 text-center text-xs text-muted-foreground">
                    Select multiple subjects to mix them in one test.
                    <button
                      type="button"
                      className="mx-auto mt-2 block rounded-md px-4 py-1.5 font-semibold text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => setSubjectPickerOpen(false)}
                    >
                      OK
                    </button>
                  </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="exam">Exam category</Label>
            <Select value={exam} onValueChange={setExam}>
              <SelectTrigger id="exam">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Any exam</SelectItem>
                {EXAM_CATEGORIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="count">Number of questions</Label>
            <Select value={String(count)} onValueChange={(v) => setCount(Number(v))}>
              <SelectTrigger id="count">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTS.map((c) => (
                  <SelectItem key={c} value={String(c)}>
                    {c} questions
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {start.isSuccess && start.data.length === 0 && (
          <p className="mt-5 rounded-lg bg-warning-soft px-4 py-3 text-sm text-foreground">
            No MCQs match these choices yet. Try a different subject or exam category.
          </p>
        )}
        {start.isError && (
          <p className="mt-5 rounded-lg bg-danger-soft px-4 py-3 text-sm text-foreground">
            Couldn't load questions. Please try again.
          </p>
        )}

        <Button
          size="lg"
          variant="brand"
          className="mt-6 w-full"
          disabled={start.isPending}
          onClick={() => start.mutate()}
        >
          {start.isPending ? <Loader2 className="animate-spin" /> : <Play />}
          {mode === "practice" ? "Start practice" : "Start exam"}
        </Button>
      </div>
    </div>
  );
}
