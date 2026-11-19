import { isPreviewMode, supabaseRest } from "../supabase";

export type JobStatus = "draft" | "published";
export const JOB_SECTORS = ["government", "private"] as const;
export type JobSector = (typeof JOB_SECTORS)[number];
export const JOB_SOURCES = [
  "PPSC",
  "FPSC",
  "NJP",
  "PJP",
  "KP Jobs",
  "SPSC",
  "NTS",
  "Other",
] as const;
export type JobSource = (typeof JOB_SOURCES)[number];

export interface JobListing {
  id: string;
  title: string;
  organization: string;
  location: string;
  employment_type: string;
  sector: JobSector;
  recruitment_source: JobSource;
  qualification: string | null;
  description: string;
  deadline: string | null;
  apply_url: string;
  status: JobStatus;
  source_external_id: string | null;
  source_url: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export type JobListingInput = Omit<
  JobListing,
  "id" | "created_at" | "updated_at" | "source_external_id" | "source_url" | "last_seen_at"
>;

let previewJobs: JobListing[] = [];

export async function listPublishedJobs(): Promise<JobListing[]> {
  if (!isPreviewMode) {
    const today = new Date().toISOString().slice(0, 10);
    const recentlySeen = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const query = new URLSearchParams({
      select: "*",
      status: "eq.published",
      and: `(or(deadline.is.null,deadline.gte.${today}),or(source_external_id.is.null,last_seen_at.gte.${recentlySeen}))`,
      order: "deadline.asc.nullslast,created_at.desc",
    });
    const { data } = await supabaseRest<JobListing[]>(`jobs?${query}`);
    return data;
  }
  const today = new Date().toISOString().slice(0, 10);
  const recentlySeen = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  return previewJobs
    .filter(
      (job) =>
        job.status === "published" &&
        (!job.deadline || job.deadline >= today) &&
        (!job.source_external_id || Boolean(job.last_seen_at && job.last_seen_at >= recentlySeen)),
    )
    .sort(
      (a, b) =>
        (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999") ||
        b.created_at.localeCompare(a.created_at),
    );
}

export async function listAdminJobs(): Promise<JobListing[]> {
  if (!isPreviewMode) {
    const query = new URLSearchParams({ select: "*", order: "created_at.desc" });
    const { data } = await supabaseRest<JobListing[]>(`jobs?${query}`);
    return data;
  }
  return [...previewJobs].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createJob(input: JobListingInput): Promise<JobListing> {
  const row = {
    ...input,
    source_external_id: null,
    source_url: null,
    last_seen_at: null,
    updated_at: new Date().toISOString(),
  };
  if (!isPreviewMode) {
    const { data } = await supabaseRest<JobListing[]>("jobs?select=*", {
      method: "POST",
      body: row,
      prefer: "return=representation",
    });
    if (!data[0])
      throw new Error("The job was not saved. Check that your account has admin access.");
    return data[0];
  }
  const now = new Date().toISOString();
  const job: JobListing = {
    ...row,
    id: `local-${crypto.randomUUID()}`,
    created_at: now,
    updated_at: now,
  };
  previewJobs = [job, ...previewJobs];
  return job;
}

export async function updateJob(id: string, input: JobListingInput): Promise<JobListing> {
  const query = new URLSearchParams({ id: `eq.${id}`, select: "*" });
  if (!isPreviewMode) {
    const { data } = await supabaseRest<JobListing[]>(`jobs?${query}`, {
      method: "PATCH",
      body: { ...input, updated_at: new Date().toISOString() },
      prefer: "return=representation",
    });
    if (!data[0])
      throw new Error("The job was not updated. Check that your account has admin access.");
    return data[0];
  }
  const index = previewJobs.findIndex((job) => job.id === id);
  if (index < 0) throw new Error("Job listing not found.");
  const updated = { ...previewJobs[index]!, ...input, updated_at: new Date().toISOString() };
  previewJobs[index] = updated;
  return updated;
}

export async function deleteJob(id: string): Promise<void> {
  if (!isPreviewMode) {
    const query = new URLSearchParams({ id: `eq.${id}`, select: "id" });
    const { data } = await supabaseRest<Array<{ id: string }>>(`jobs?${query}`, {
      method: "DELETE",
      prefer: "return=representation",
    });
    if (!data.length)
      throw new Error("Job listing not found or this account does not have admin access.");
    return;
  }
  previewJobs = previewJobs.filter((job) => job.id !== id);
}
