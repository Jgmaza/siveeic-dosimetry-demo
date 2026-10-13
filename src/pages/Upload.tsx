import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { PERIODS } from "../mock/db";

type UploadPhase = "idle" | "validating" | "validated" | "committing" | "done";

type ValidationError = {
  row: number;
  field: string;
  message: string;
};

type ValidationResult = {
  fileName: string;
  period: string;
  totalRows: number;
  okRows: number;
  errorRows: number;
  errors: ValidationError[];
  dualWriteNote: string;
};

type CommitResult = {
  inserted: number;
  period: string;
  fileName: string;
  source: string;
  filesForOperatorPeriod: number;
  filesInSystem: number;
  message: string;
};

/**
 * Layout mirrors SIVEEIC Angular dosimetria-upload:
 * card → period → dropzone → validate/save → completed summary.
 * Polished within the existing Dose Ledger shell — not a new brand.
 */
export function Upload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [period, setPeriod] = useState(PERIODS[0] ?? "2025");
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [commit, setCommit] = useState<CommitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const busy = phase === "validating" || phase === "committing";
  const showSave = phase === "validated" && (validation?.okRows ?? 0) > 0;
  const errorPreview = useMemo(
    () => validation?.errors.slice(0, 6) ?? [],
    [validation],
  );

  function pickFile(next: File | null) {
    setFile(next);
    setPhase("idle");
    setValidation(null);
    setCommit(null);
    setError(null);
    setProgress(0);
  }

  function reset() {
    pickFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function runValidate() {
    if (!file) return;
    setError(null);
    setPhase("validating");
    setProgress(8);
    const timer = window.setInterval(() => {
      setProgress((p) => Math.min(p + 11, 92));
    }, 120);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("period", period);
      const result = await api<ValidationResult>("/api/upload/validate", {
        method: "POST",
        body: form,
      });
      setValidation(result);
      setPhase("validated");
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al validar");
      setPhase("idle");
      setProgress(0);
    } finally {
      window.clearInterval(timer);
    }
  }

  async function runCommit() {
    if (!file || !validation) return;
    setError(null);
    setPhase("committing");
    setProgress(12);
    const timer = window.setInterval(() => {
      setProgress((p) => Math.min(p + 14, 90));
    }, 100);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("period", period);
      form.append("okRows", String(validation.okRows));
      const result = await api<CommitResult>("/api/upload/commit", {
        method: "POST",
        body: form,
      });
      setCommit(result);
      setPhase("done");
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setPhase("validated");
      setProgress(100);
    } finally {
      window.clearInterval(timer);
    }
  }

  function downloadErrors() {
    if (!validation) return;
    const lines = [
      "row,field,message",
      ...validation.errors.map(
        (e) => `${e.row},${JSON.stringify(e.field)},${JSON.stringify(e.message)}`,
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Reporte_Errores_${validation.period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (phase === "done" && commit) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="border border-line bg-white shadow-sm">
          <div className="border-b border-line px-5 py-3">
            <h2 className="text-lg font-semibold text-ink">
              Carga de datos masivos
            </h2>
          </div>
          <div className="grid gap-6 px-5 py-8 sm:grid-cols-[140px_1fr] sm:items-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-emerald-50 text-4xl text-emerald-700">
              ✓
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-semibold text-ink">
                ¡El reporte de datos ha sido cargado con éxito!
              </h3>
              <p className="mt-2 text-sm text-muted">
                Los datos han sido validados e ingresados al sistema (demo mock).
              </p>
              <p className="mt-3 text-sm text-muted">
                Registros insertados:{" "}
                <span className="font-mono text-ink">{commit.inserted}</span>.
                Archivos cargados (operador/periodo):{" "}
                <span className="font-mono text-ink">
                  {commit.filesForOperatorPeriod}
                </span>
                . Total archivos en sistema:{" "}
                <span className="font-mono text-ink">{commit.filesInSystem}</span>.
              </p>
              <p className="mt-2 font-mono text-[11px] text-muted">
                Fuente NUEVO · periodo {commit.period} · {commit.fileName}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 border-t border-line px-5 py-4">
            <Link
              to="/ledger"
              className="rounded bg-accent px-4 py-2 text-sm text-canvas hover:opacity-90"
            >
              Ir al ledger unificado
            </Link>
            <button
              type="button"
              onClick={reset}
              className="rounded border border-line bg-white px-4 py-2 text-sm text-ink hover:border-accent"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="border border-line bg-white shadow-sm">
        <div className="border-b border-line px-5 py-3">
          <h2 className="text-lg font-semibold text-ink">
            Cargar archivo de datos
          </h2>
          <p className="mt-1 text-sm text-muted">
            Misma secuencia que SIVEEIC: periodo → archivo → validar → guardar.
            Datos ficticios.
          </p>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="max-w-xs">
            <label htmlFor="Periodo" className="mb-1 block text-sm text-ink">
              <span className="text-red-600">*</span> Periodo (año)
            </label>
            <select
              id="Periodo"
              value={period}
              disabled={busy}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full rounded border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            >
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onClick={() => !busy && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const next = e.dataTransfer.files?.[0] ?? null;
              if (next) pickFile(next);
            }}
            className={`rounded border-2 border-dashed px-4 py-10 text-center ${
              dragOver
                ? "border-accent bg-soft"
                : "border-line bg-slate-50 hover:border-accent/60"
            } ${busy ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
          >
            <p className="text-sm text-ink">
              {file
                ? file.name
                : "Arrastre el archivo aquí o haga clic para seleccionar"}
            </p>
            <p className="mt-2 text-xs text-muted">
              .csv, .xlsx, .xls
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div>
            <button
              type="button"
              disabled={!file || busy || phase === "validated"}
              onClick={runValidate}
              className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cargar datos masivos
            </button>
            <p className="mt-1 text-xs text-muted">
              En la app real esto dispara la validación del Excel; aquí es mock.
            </p>
          </div>

          {busy || progress > 0 ? (
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted">
                <span>
                  {phase === "validating"
                    ? "Validando archivo…"
                    : phase === "committing"
                      ? "Guardando…"
                      : "Listo"}
                </span>
                <span className="font-mono">{progress}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded bg-slate-200">
                <div
                  className="h-full bg-emerald-600 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          {validation && phase === "validated" ? (
            <div className="space-y-3 rounded border border-line bg-slate-50 p-4">
              <p className="text-sm text-ink">
                Validación:{" "}
                <span className="font-mono">{validation.okRows}</span> OK /{" "}
                <span className="font-mono">{validation.totalRows}</span> filas
                {validation.errorRows > 0 ? (
                  <>
                    {" "}
                    · <span className="font-mono text-red-700">{validation.errorRows}</span>{" "}
                    con error
                  </>
                ) : null}
              </p>
              {errorPreview.length > 0 ? (
                <ul className="space-y-1 font-mono text-xs text-muted">
                  {errorPreview.map((e) => (
                    <li key={`${e.row}-${e.field}`}>
                      Fila {e.row}: {e.message}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-emerald-700">Sin errores de validación.</p>
              )}
              <p className="text-xs text-muted">{validation.dualWriteNote}</p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-1">
            {validation && validation.errorRows > 0 ? (
              <button
                type="button"
                onClick={downloadErrors}
                className="rounded border border-amber-500 px-3 py-2 text-sm text-amber-800 hover:bg-amber-50"
              >
                Descargar archivo de errores
              </button>
            ) : null}
            {showSave ? (
              <button
                type="button"
                disabled={busy}
                onClick={runCommit}
                className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
              >
                Guardar
              </button>
            ) : null}
            {file ? (
              <button
                type="button"
                disabled={busy}
                onClick={reset}
                className="rounded border border-line px-3 py-2 text-sm text-muted hover:text-ink"
              >
                Limpiar
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
