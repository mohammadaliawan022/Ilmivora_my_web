import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import {
  getExamCategoryCounts,
  getRecentMcqs,
  getSubjectCounts,
  getSubmissionCounts,
  listMcqs,
  listSubmissions,
  type McqFilters,
  type SubmissionStatus,
} from "./mcq-repo";

import { getSubjectIntro, listSubjectIntros } from "./subject-intro-repo";
import { listPastPapers } from "./past-paper-repo";
import { listAdminJobs, listPublishedJobs } from "./job-repo";

export const publishedJobsQuery = () =>
  queryOptions({ queryKey: ["jobs", "published"], queryFn: listPublishedJobs });

export const adminJobsQuery = () =>
  queryOptions({ queryKey: ["jobs", "admin"], queryFn: listAdminJobs });

export const pastPapersQuery = () =>
  queryOptions({ queryKey: ["past-papers"], queryFn: listPastPapers });

export const subjectIntroQuery = (slug: string) =>
  queryOptions({ queryKey: ["subject-intros", slug], queryFn: () => getSubjectIntro(slug) });

export const subjectIntroListQuery = () =>
  queryOptions({ queryKey: ["subject-intros", "all"], queryFn: listSubjectIntros });

export const mcqListQuery = (filters: McqFilters, page: number, pageSize?: number) =>
  queryOptions({
    queryKey: ["mcqs", "list", filters, page, pageSize],
    queryFn: () => listMcqs(filters, page, pageSize),
    placeholderData: keepPreviousData,
  });

export const recentMcqsQuery = (limit = 6) =>
  queryOptions({ queryKey: ["mcqs", "recent", limit], queryFn: () => getRecentMcqs(limit) });

export const subjectCountsQuery = () =>
  queryOptions({ queryKey: ["mcqs", "subject-counts"], queryFn: getSubjectCounts });

export const examCountsQuery = () =>
  queryOptions({ queryKey: ["mcqs", "exam-counts"], queryFn: getExamCategoryCounts });

export const submissionListQuery = (status: SubmissionStatus, page: number) =>
  queryOptions({
    queryKey: ["submissions", "list", status, page],
    queryFn: () => listSubmissions(status, page),
    placeholderData: keepPreviousData,
  });

export const submissionCountsQuery = () =>
  queryOptions({ queryKey: ["submissions", "counts"], queryFn: getSubmissionCounts });
