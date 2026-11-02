import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import {
  getExamCategoryCounts,
  getRecentMcqs,
  getSubjectCounts,
  listMcqs,
  type McqFilters,
} from "./mcq-repo";

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
