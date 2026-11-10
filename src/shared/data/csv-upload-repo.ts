import { isPreviewMode, supabaseRest } from "../supabase";

export interface CsvUpload {
  id: string;
  filename: string;
  uploaded_at: string;
  imported_count: number;
  status: "uploading" | "completed" | "failed";
}

export type CsvUploadInput = Pick<CsvUpload, "filename" | "imported_count">;

let previewUploads: CsvUpload[] = [];

export async function listCsvUploads(): Promise<CsvUpload[]> {
  if (!isPreviewMode) {
    const query = new URLSearchParams({ select: "*", order: "uploaded_at.desc" });
    const { data } = await supabaseRest<CsvUpload[]>(`mcq_csv_uploads?${query}`);
    return data;
  }
  return [...previewUploads].sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at));
}

export async function createCsvUpload(input: CsvUploadInput): Promise<CsvUpload> {
  if (!isPreviewMode) {
    const { data } = await supabaseRest<CsvUpload[]>("mcq_csv_uploads?select=*", {
      method: "POST",
      body: { ...input, status: "uploading" },
      prefer: "return=representation",
    });
    if (!data[0]) throw new Error("Could not record this CSV upload. Check admin access and try again.");
    return data[0];
  }
  const upload: CsvUpload = {
    ...input,
    id: `local-${crypto.randomUUID()}`,
    uploaded_at: new Date().toISOString(),
    status: "uploading",
  };
  previewUploads = [upload, ...previewUploads];
  return upload;
}

export async function finishCsvUpload(id: string, status: "completed" | "failed", importedCount: number): Promise<void> {
  if (!isPreviewMode) {
    const query = new URLSearchParams({ id: `eq.${id}`, select: "id" });
    const { data } = await supabaseRest<Array<{ id: string }>>(`mcq_csv_uploads?${query}`, {
      method: "PATCH",
      body: { status, imported_count: importedCount },
      prefer: "return=representation",
    });
    if (!data.length) throw new Error("CSV upload status could not be saved.");
    return;
  }
  previewUploads = previewUploads.map((upload) =>
    upload.id === id ? { ...upload, status, imported_count: importedCount } : upload,
  );
}
