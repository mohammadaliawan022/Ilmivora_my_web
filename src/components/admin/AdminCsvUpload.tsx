import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, Clock3, Download, FileUp, LoaderCircle, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { bulkInsertMcqs, listMcqs } from "@/lib/data/mcq-repo";
import { createCsvUpload, finishCsvUpload, listCsvUploads, type CsvUpload } from "@/lib/data/csv-upload-repo";
import { OPTIONAL_CSV_COLUMNS, REQUIRED_CSV_COLUMNS, csvToMcqs, type CsvImportResult } from "@/lib/csv";

const TEMPLATE =
  [...REQUIRED_CSV_COLUMNS, ...OPTIONAL_CSV_COLUMNS].join(",") +
  '\n"What is the capital of Pakistan?",Karachi,Lahore,Islamabad,Peshawar,C,General Knowledge,"Islamabad became the capital in 1967.",PPSC,false\n';
const PREVIEW_PAGE_SIZE = 10;
const HISTORY_PAGE_SIZE = 10;

function CsvUploadHistoryItem({ upload }: { upload: CsvUpload }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const questions = useQuery({
    queryKey: ["csv-upload-mcqs", upload.id, page],
    queryFn: () => listMcqs({ csvUploadId: upload.id, includeHidden: true }, page, HISTORY_PAGE_SIZE),
    enabled: open && upload.status === "completed",
  });
  const timestamp = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(upload.uploaded_at));

  return (
    <section className="rounded-xl border border-border bg-card/60">
      <button
        type="button"
        className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="rounded-lg bg-primary-soft p-2 text-primary"><FileUp className="h-4 w-4" /></span>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{upload.filename}</span>
            <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{timestamp}</span>
              <span>{upload.imported_count.toLocaleString()} questions</span>
            </span>
          </span>
        </span>
        <span className="flex items-center gap-2 text-xs font-medium">
          {upload.status === "completed" ? (
            <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="h-4 w-4" />Imported</span>
          ) : upload.status === "failed" ? (
            <span className="inline-flex items-center gap-1 text-danger"><CircleAlert className="h-4 w-4" />Failed</span>
          ) : (
            <span className="inline-flex items-center gap-1 text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" />In progress</span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3">
          {upload.status !== "completed" ? (
            <p className="text-sm text-muted-foreground">Questions are unavailable for this upload.</p>
          ) : questions.isPending ? (
            <p className="text-sm text-muted-foreground">Loading questions…</p>
          ) : questions.isError ? (
            <p className="text-sm text-danger">Could not load questions for this CSV.</p>
          ) : questions.data?.items.length ? (
            <>
              <ol className="space-y-3">
                {questions.data.items.map((mcq, index) => (
                  <li key={mcq.id} className="rounded-lg bg-muted/50 px-3 py-2">
                    <p className="text-xs text-muted-foreground">Question {(page - 1) * HISTORY_PAGE_SIZE + index + 1} · {mcq.subject}</p>
                    <p className="mt-1 text-sm font-medium">{mcq.question}</p>
                  </li>
                ))}
              </ol>
              {questions.data.pageCount > 1 && (
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Page {questions.data.page} of {questions.data.pageCount}</span>
                  <span className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>Previous</Button>
                    <Button type="button" variant="outline" size="sm" disabled={page >= questions.data.pageCount} onClick={() => setPage((n) => n + 1)}>Next</Button>
                  </span>
                </div>
              )}
            </>
          ) : <p className="text-sm text-muted-foreground">No questions found for this CSV.</p>}
        </div>
      )}
    </section>
  );
}

export function AdminCsvUpload() {
  const qc = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [previewPage, setPreviewPage] = useState(1);
  const history = useQuery({ queryKey: ["csv-upload-history"], queryFn: listCsvUploads });

  const cancelSelection = () => {
    setFileName(null);
    setResult(null);
    setPreviewPage(1);
    if (fileInput.current) fileInput.current.value = "";
  };

  const importRows = useMutation({
    mutationFn: async () => {
      const rows = result?.rows ?? [];
      const upload = await createCsvUpload({ filename: fileName ?? "uploaded.csv", imported_count: rows.length });
      let imported: number;
      try {
        imported = await bulkInsertMcqs(rows, upload.id);
      } catch (error) {
        try { await finishCsvUpload(upload.id, "failed", 0); } catch { /* preserve the original import error */ }
        throw error;
      }
      try {
        await finishCsvUpload(upload.id, "completed", imported);
      } catch {
        return { imported, historyUpdateFailed: true };
      }
      return { imported, historyUpdateFailed: false };
    },
    onSuccess: ({ imported, historyUpdateFailed }) => {
      if (historyUpdateFailed) toast.warning(`${imported} MCQs imported, but the history status did not update. Refresh and check the upload record.`);
      else toast.success(`${imported} MCQs imported`);
      cancelSelection();
      qc.invalidateQueries({ queryKey: ["mcqs"] });
      qc.invalidateQueries({ queryKey: ["csv-upload-history"] });
    },
    onError: (e: Error) => {
      toast.error(e.message);
      qc.invalidateQueries({ queryKey: ["csv-upload-history"] });
    },
  });

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setPreviewPage(1);
    setResult(csvToMcqs(await file.text()));
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "ilmivora-mcq-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="card-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Bulk CSV upload</h3>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Required columns: <code className="text-foreground">{REQUIRED_CSV_COLUMNS.join(", ")}</code>.
              Optional: <code className="text-foreground">{OPTIONAL_CSV_COLUMNS.join(", ")}</code>.
              Rows are checked before anything is imported.
            </p>
          </div>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download /> Template
          </Button>
        </div>
        <label className="mt-6 flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-primary hover:bg-primary-soft">
          <FileUp className="h-8 w-8 text-primary" />
          <span className="font-semibold">{fileName ?? "Choose a CSV file"}</span>
          <span className="text-xs text-muted-foreground">UTF-8 encoded .csv</span>
          <input
            ref={fileInput}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>
        {fileName && (
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={importRows.isPending}
              onClick={cancelSelection}
            >
              <X /> Cancel CSV
            </Button>
          </div>
        )}
      </div>

      {result && (
        <div className="card-surface p-6">
          {result.missingColumns.length > 0 ? (
            <p className="rounded-lg bg-danger-soft px-4 py-3 text-sm">
              Missing columns: <strong>{result.missingColumns.join(", ")}</strong>
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">
                  <strong className="text-success">{result.rows.length} valid</strong>
                  {result.errors.length > 0 && (
                    <>
                      {" · "}
                      <strong className="text-danger">{result.errors.length} with problems</strong>
                    </>
                  )}
                </p>
                <Button
                  disabled={result.rows.length === 0 || importRows.isPending}
                  onClick={() => importRows.mutate()}
                >
                  <Upload /> Import {result.rows.length} MCQs
                </Button>
              </div>
              {result.errors.length > 0 && (
                <ul className="mt-4 max-h-40 space-y-1 overflow-y-auto rounded-lg bg-danger-soft p-3 text-xs">
                  {result.errors.slice(0, 50).map((e) => (
                    <li key={e.line}>
                      Line {e.line}: {e.message}
                    </li>
                  ))}
                </ul>
              )}
              {result.rows.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Preview {((previewPage - 1) * PREVIEW_PAGE_SIZE) + 1}–{Math.min(previewPage * PREVIEW_PAGE_SIZE, result.rows.length)} of {result.rows.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={previewPage === 1}
                        onClick={() => setPreviewPage((page) => Math.max(1, page - 1))}
                        aria-label="Previous preview page"
                      >
                        <ChevronLeft /> Previous
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Page {previewPage} of {Math.ceil(result.rows.length / PREVIEW_PAGE_SIZE)}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={previewPage >= Math.ceil(result.rows.length / PREVIEW_PAGE_SIZE)}
                        onClick={() => setPreviewPage((page) => Math.min(Math.ceil(result.rows.length / PREVIEW_PAGE_SIZE), page + 1))}
                        aria-label="Next preview page"
                      >
                        Next <ChevronRight />
                      </Button>
                    </div>
                  </div>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-border">
                      {result.rows
                        .slice((previewPage - 1) * PREVIEW_PAGE_SIZE, previewPage * PREVIEW_PAGE_SIZE)
                        .map((r, i) => (
                        <tr key={(previewPage - 1) * PREVIEW_PAGE_SIZE + i}>
                          <td className="py-2 pr-3 font-medium">{r.question}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{r.subject}</td>
                          <td className="py-2 font-bold text-success">{r.correct_answer}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="card-surface space-y-4 p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">CSV upload history</h3>
            <p className="mt-1 text-sm text-muted-foreground">Each CSV is recorded separately with its upload time and imported questions.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => history.refetch()} disabled={history.isFetching}>Refresh</Button>
        </div>
        {history.isPending ? <p className="text-sm text-muted-foreground">Loading upload history…</p>
          : history.isError ? <p className="text-sm text-danger">Could not load CSV upload history.</p>
            : history.data.length ? <div className="space-y-3">{history.data.map((upload) => <CsvUploadHistoryItem key={upload.id} upload={upload} />)}</div>
              : <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">No CSV uploads recorded yet. New uploads will appear here, newest first.</p>}
      </div>
    </div>
  );
}
