import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, FileUp, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { bulkInsertMcqs } from "@/lib/data/mcq-repo";
import { OPTIONAL_CSV_COLUMNS, REQUIRED_CSV_COLUMNS, csvToMcqs, type CsvImportResult } from "@/lib/csv";

const TEMPLATE =
  [...REQUIRED_CSV_COLUMNS, ...OPTIONAL_CSV_COLUMNS].join(",") +
  '\n"What is the capital of Pakistan?",Karachi,Lahore,Islamabad,Peshawar,C,General Knowledge,"Islamabad became the capital in 1967.",PPSC,\n';

export function AdminCsvUpload() {
  const qc = useQueryClient();
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);

  const importRows = useMutation({
    mutationFn: () => bulkInsertMcqs(result?.rows ?? []),
    onSuccess: (n) => {
      toast.success(`${n} MCQs imported`);
      setResult(null);
      setFileName(null);
      qc.invalidateQueries({ queryKey: ["mcqs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
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
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>
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
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">Preview (first 5)</p>
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-border">
                      {result.rows.slice(0, 5).map((r, i) => (
                        <tr key={i}>
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
    </div>
  );
}
