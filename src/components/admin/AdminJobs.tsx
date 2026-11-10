import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BriefcaseBusiness, CalendarDays, ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createJob,
  deleteJob,
  updateJob,
  type JobListing,
  type JobListingInput,
  JOB_SOURCES,
  type JobStatus,
} from "@/lib/data/job-repo";
import { adminJobsQuery } from "@/lib/data/queries";

const blankForm: JobListingInput = {
  title: "",
  organization: "",
  location: "",
  employment_type: "Government",
  recruitment_source: "PPSC",
  qualification: "",
  description: "",
  deadline: null,
  apply_url: "",
  status: "draft",
};

const statusClass: Record<JobStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-success-soft text-success",
};

function displayDate(date: string | null): string {
  if (!date) return "No closing date set";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${date}T00:00:00Z`));
}

export function AdminJobs() {
  const queryClient = useQueryClient();
  const jobs = useQuery(adminJobsQuery());
  const [editing, setEditing] = useState<JobListing | null>(null);
  const [form, setForm] = useState<JobListingInput>(blankForm);

  const save = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: JobListingInput }) => id ? updateJob(id, input) : createJob(input),
    onSuccess: (_job, variables) => {
      toast.success(variables.id ? "Job listing updated" : "Job listing saved");
      setEditing(null);
      setForm(blankForm);
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      toast.success("Job listing deleted");
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const reset = () => {
    setEditing(null);
    setForm(blankForm);
  };

  const edit = (job: JobListing) => {
    setEditing(job);
    setForm({
      title: job.title,
      organization: job.organization,
      location: job.location,
      employment_type: job.employment_type,
      recruitment_source: job.recruitment_source,
      qualification: job.qualification ?? "",
      description: job.description,
      deadline: job.deadline,
      apply_url: job.apply_url,
      status: job.status,
    });
    document.getElementById("job-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let parsed: URL;
    try {
      parsed = new URL(form.apply_url);
    } catch {
      toast.error("Enter a valid application URL.");
      return;
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      toast.error("The application URL must start with https:// or http://.");
      return;
    }
    save.mutate({
      ...(editing ? { id: editing.id } : {}),
      input: {
        ...form,
        title: form.title.trim(),
        organization: form.organization.trim(),
        location: form.location.trim(),
        employment_type: form.employment_type.trim(),
        qualification: form.qualification?.trim() || null,
        description: form.description.trim(),
        apply_url: parsed.toString(),
      },
    });
  };

  const set = <K extends keyof JobListingInput>(key: K, value: JobListingInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="space-y-7">
      <form id="job-editor" onSubmit={submit} className="card-surface max-w-4xl scroll-mt-24 space-y-5 p-6 md:p-8">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><BriefcaseBusiness aria-hidden="true" /></div>
          <div>
            <h2 className="text-lg font-bold">{editing ? "Edit job listing" : "Add a job listing"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Published jobs appear on the public Jobs page. Drafts remain visible only in this admin panel.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="job-title">Job title</Label><Input id="job-title" required maxLength={200} value={form.title} onChange={(event) => set("title", event.target.value)} placeholder="Assistant Director (BS-17)" /></div>
          <div className="space-y-2"><Label htmlFor="job-organization">Department / organisation</Label><Input id="job-organization" required maxLength={180} value={form.organization} onChange={(event) => set("organization", event.target.value)} placeholder="Punjab Public Service Commission" /></div>
          <div className="space-y-2"><Label htmlFor="job-location">Location</Label><Input id="job-location" required maxLength={120} value={form.location} onChange={(event) => set("location", event.target.value)} placeholder="Lahore, Punjab" /></div>
          <div className="space-y-2"><Label htmlFor="job-type">Employment type / scale</Label><Input id="job-type" required maxLength={80} value={form.employment_type} onChange={(event) => set("employment_type", event.target.value)} placeholder="Regular · BS-17" /></div>
          <div className="space-y-2"><Label htmlFor="job-source">Recruitment section</Label>
            <select id="job-source" className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" value={form.recruitment_source} onChange={(event) => set("recruitment_source", event.target.value as JobListingInput["recruitment_source"])}>
              {JOB_SOURCES.map((source) => <option key={source} value={source}>{source === "Other" ? "Other / not listed" : source}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label htmlFor="job-deadline">Last date to apply</Label><Input id="job-deadline" type="date" value={form.deadline ?? ""} onChange={(event) => set("deadline", event.target.value || null)} /></div>
          <div className="space-y-2"><Label htmlFor="job-status">Listing status</Label>
            <select id="job-status" className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring" value={form.status} onChange={(event) => set("status", event.target.value as JobStatus)}>
              <option value="draft">Draft</option><option value="published">Published</option>
            </select>
          </div>
        </div>
        <div className="space-y-2"><Label htmlFor="job-qualification">Qualification / eligibility summary (optional)</Label><Input id="job-qualification" maxLength={500} value={form.qualification ?? ""} onChange={(event) => set("qualification", event.target.value)} placeholder="Bachelor’s degree; see official advertisement for full criteria" /></div>
        <div className="space-y-2"><Label htmlFor="job-description">Job details</Label><Textarea id="job-description" required maxLength={5000} rows={6} value={form.description} onChange={(event) => set("description", event.target.value)} placeholder="Summarise the role, number of posts, how to apply and any important instructions. Use the official advertisement as the source." /></div>
        <div className="space-y-2"><Label htmlFor="job-url">Official application / advertisement link</Label><Input id="job-url" type="url" required maxLength={2048} value={form.apply_url} onChange={(event) => set("apply_url", event.target.value)} placeholder="https://official.gov.pk/apply" /></div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={save.isPending}><Plus aria-hidden="true" />{save.isPending ? "Saving…" : editing ? "Save changes" : "Add job"}</Button>
          {editing && <Button type="button" variant="outline" onClick={reset} disabled={save.isPending}><X aria-hidden="true" />Cancel edit</Button>}
        </div>
      </form>

      <section className="space-y-3" aria-labelledby="saved-jobs-heading">
        <div className="flex items-center justify-between gap-3"><h2 id="saved-jobs-heading" className="text-lg font-bold">Your job listings ({jobs.data?.length ?? 0})</h2><span className="text-sm text-muted-foreground">Published jobs with past deadlines are hidden from visitors.</span></div>
        {jobs.isPending ? <p className="card-surface p-6 text-sm text-muted-foreground">Loading job listings…</p>
          : jobs.isError ? <p role="alert" className="card-surface p-6 text-sm text-danger">{jobs.error.message}</p>
          : !jobs.data.length ? <p className="card-surface p-8 text-center text-sm text-muted-foreground">No listings yet. Add your first vacancy above.</p>
          : <ul className="space-y-3">{jobs.data.map((job) => (
            <li key={job.id} className="card-surface flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{job.title}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass[job.status]}`}>{job.status}</span></div>
                <p className="mt-1 text-sm text-muted-foreground">{job.recruitment_source} · {job.organization} · {job.location} · {job.employment_type}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays aria-hidden="true" className="h-3.5 w-3.5" /> Apply by {displayDate(job.deadline)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                <Button variant="ghost" size="sm" onClick={() => edit(job)}><Pencil aria-hidden="true" />Edit</Button>
                <Button variant="ghost" size="icon" asChild><a href={job.apply_url} target="_blank" rel="noopener noreferrer" aria-label={`Open official listing for ${job.title}`}><ExternalLink aria-hidden="true" /></a></Button>
                <Button variant="ghost" size="icon" aria-label={`Delete ${job.title}`} disabled={remove.isPending} onClick={() => { if (window.confirm(`Delete “${job.title}”?`)) remove.mutate(job.id); }}><Trash2 className="text-danger" /></Button>
              </div>
            </li>
          ))}</ul>}
      </section>
    </div>
  );
}
