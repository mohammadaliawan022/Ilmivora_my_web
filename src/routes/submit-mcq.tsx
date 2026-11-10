import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/site/PageHeader";
import { McqForm } from "@/components/mcq/McqForm";
import { submitMcq, type McqInput } from "@/shared/data/mcq-repo";

export const Route = createFileRoute("/submit-mcq")({
  head: () => ({
    meta: [
      { title: "Submit an MCQ — Ilmivora" },
      {
        name: "description",
        content: "Share an MCQ with other aspirants. Every submission is checked by an Ilmivora admin before it goes live.",
      },
      { property: "og:title", content: "Submit an MCQ — Ilmivora" },
      { property: "og:description", content: "Contribute MCQs for PPSC, FPSC and NTS preparation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: SubmitPage,
});

function SubmitPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const send = useMutation({
    mutationFn: (v: McqInput) => submitMcq({ ...v, submitter_name: name.trim() || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      setDone(true);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader
        eyebrow="Contribute"
        title="Submit an MCQ"
        description="Know a good question? Share it. An admin checks every MCQ before it appears on the site."
      />
      <div className="container-page max-w-3xl py-10">
        {done ? (
          <div className="card-surface flex flex-col items-center gap-4 p-10 text-center animate-rise">
            <CheckCircle2 className="h-12 w-12 text-success" />
            <h2 className="text-2xl font-bold">Thank you! Your MCQ was sent for review.</h2>
            <p className="max-w-md text-muted-foreground">
              Once an admin approves it, it will appear under its subject for everyone to practise.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => {
                  setDone(false);
                  setFormKey((k) => k + 1);
                }}
              >
                <Plus /> Submit another
              </Button>
              <Button variant="outline" asChild>
                <Link to="/subjects">Browse subjects</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="card-surface p-6 md:p-8">
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-primary-soft px-4 py-3 text-sm">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-foreground">
                Please check spelling and make sure the correct answer is right. Submissions are reviewed
                before publishing.
              </p>
            </div>
            <McqForm key={formKey} resetKey={formKey} onSubmit={(v) => send.mutate(v)} pending={send.isPending} submitLabel="Send for review">
              <div className="space-y-2">
                <Label htmlFor="submitter">Your name (optional)</Label>
                <Input
                  id="submitter"
                  value={name}
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                />
                <p className="text-xs text-muted-foreground">
                  If entered, your name will appear with this question after an admin approves it.
                </p>
              </div>
            </McqForm>
          </div>
        )}
      </div>
    </>
  );
}
