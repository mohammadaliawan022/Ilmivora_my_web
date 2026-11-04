import { isPreviewMode, supabaseRest } from "../supabase";

export interface PastPaper {
  id: string;
  title: string;
  exam: string;
  year: number;
  url: string | null;
  created_at: string;
}

export type PastPaperInput = Omit<PastPaper, "id" | "created_at">;

let previewPapers: PastPaper[] = [];

export async function listPastPapers(): Promise<PastPaper[]> {
  if (!isPreviewMode) {
    const query = new URLSearchParams({ select: "*", order: "year.desc,created_at.desc" });
    const { data } = await supabaseRest<PastPaper[]>(`past_papers?${query}`);
    return data;
  }
  return [...previewPapers].sort((a, b) => b.year - a.year || b.created_at.localeCompare(a.created_at));
}

export async function createPastPaper(input: PastPaperInput): Promise<PastPaper> {
  if (!isPreviewMode) {
    const { data } = await supabaseRest<PastPaper[]>("past_papers?select=*", {
      method: "POST",
      body: input,
      prefer: "return=representation",
    });
    if (!data[0]) throw new Error("The past paper was not saved. Check that your account has admin access.");
    return data[0];
  }
  const paper: PastPaper = { ...input, id: `local-${crypto.randomUUID()}`, created_at: new Date().toISOString() };
  previewPapers = [paper, ...previewPapers];
  return paper;
}

export async function deletePastPaper(id: string): Promise<void> {
  if (!isPreviewMode) {
    const query = new URLSearchParams({ id: `eq.${id}`, select: "id" });
    const { data } = await supabaseRest<Array<{ id: number }>>(`past_papers?${query}`, {
      method: "DELETE",
      prefer: "return=representation",
    });
    if (!data.length) throw new Error("Past paper not found or this account does not have admin access.");
    return;
  }
  previewPapers = previewPapers.filter((paper) => paper.id !== id);
}
