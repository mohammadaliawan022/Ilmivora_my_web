import { useMutation } from "@tanstack/react-query";
import { Clock, Loader2, Play, Target } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getQuizQuestions } from "@/lib/data/mcq-repo";
import { EXAM_CATEGORIES } from "@/lib/exam-categories";
import { EXAM_SECONDS_PER_QUESTION, type Mcq } from "@/lib/mcq";
import { SUBJECTS } from "@/lib/subjects";
import { ExamQuiz } from "./ExamQuiz";
import { PracticeQuiz } from "./PracticeQuiz";

const ALL = "__all__";
const COUNTS = [5, 10, 20, 30, 50];

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
  const [subject, setSubject] = useState(initialSubject ?? ALL);
  const [exam, setExam] = useState(initialExam ?? ALL);
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState<Mcq[] | null>(null);

  const start = useMutation({
    mutationFn: () =>
      getQuizQuestions(
        {
          subject: subject === ALL ? undefined : subject,
          topic: initialTopic,
          examCategory: exam === ALL ? undefined : exam,
        },
        count,
      ),
    onSuccess: (rows) => setQuestions(rows),
  });

  const label = initialTopic ?? (subject === ALL ? "Mixed subjects" : subject);
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
                ? "Instant feedback and explanations after every answer."
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All subjects (mixed)</SelectItem>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s.slug} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
