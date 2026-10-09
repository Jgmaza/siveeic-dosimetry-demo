import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import {
  MONTH_LABELS,
  companyName,
  type Company,
  type DoseRow,
  type MonthFlag,
} from "../mock/db";

function formatMonth(value: MonthFlag) {
  if (typeof value === "number") return value.toFixed(2);
  return value;
}

function SourceBadge({ source }: { source: DoseRow["source"] }) {
  const cls =
    source === "HISTORICO"
      ? "border-hist/40 text-hist"
      : source === "NUEVO"
        ? "border-neu/40 text-neu"
        : "border-accent/40 text-accent";
  return (
    <span className={`border px-1.5 py-0.5 font-mono text-[10px] ${cls}`}>
      {source}
    </span>
  );
}

export function Ledger() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [rows, setRows] = useState<DoseRow[]>([]);
  const [total, setTotal] = useState(0);
  const [flags, setFlags] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ companies: Company[]; periods: string[] }>("/api/meta")
      .then((meta) => {
        setCompanies(meta.companies);
        setPeriods(meta.periods);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error"));
  }, []);

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  async function consultar() {
    setBusy(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      selectedCompanies.forEach((c) => params.append("company", c));
      selectedPeriods.forEach((p) => params.append("period", p));
      selectedSources.forEach((s) => params.append("source", s));
      if (employeeId.trim()) params.set("employeeId", employeeId.trim());

      const res = await api<{
        total: number;
        rows: DoseRow[];
        flags: Record<string, string>;
      }>(`/api/doses?${params.toString()}`);
      setRows(res.rows);
      setTotal(res.total);
      setFlags(res.flags);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setBusy(false);
    }
  }

  const noticeCount = useMemo(
    () => rows.filter((r) => r.noticeEligible).length,
    [rows],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl text-ink">Unified ledger</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Grid stays hidden until Consultar — same rule as the production HU.
          Filters compose across company, period, source, and employee ID.
        </p>
      </div>

      <section className="space-y-4 border border-line bg-white/75 p-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
            Companies
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {companies.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  toggle(selectedCompanies, c.id, setSelectedCompanies)
                }
                className={`border px-2.5 py-1 text-xs ${
                  selectedCompanies.includes(c.id)
                    ? "border-accent bg-soft text-ink"
                    : "border-line text-muted"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
              Period
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {periods.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggle(selectedPeriods, p, setSelectedPeriods)}
                  className={`border px-2.5 py-1 font-mono text-xs ${
                    selectedPeriods.includes(p)
                      ? "border-accent bg-soft"
                      : "border-line text-muted"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
              Source
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["HISTORICO", "NUEVO", "UNIFICADO"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(selectedSources, s, setSelectedSources)}
                  className={`border px-2.5 py-1 font-mono text-[10px] ${
                    selectedSources.includes(s)
                      ? "border-accent bg-soft"
                      : "border-line text-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <label className="text-sm">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
              Employee ID
            </span>
            <input
              className="mt-2 w-full border border-line bg-canvas px-3 py-2 font-mono text-sm"
              placeholder="e.g. 1002003001"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={consultar}
          disabled={busy}
          className="border border-accent bg-accent px-4 py-2 text-sm text-canvas disabled:opacity-60"
        >
          {busy ? "Consulting…" : "Consultar"}
        </button>
      </section>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {!hasSearched ? (
        <p className="text-sm text-muted">
          No grid yet — run Consultar to load the unified projection.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <span>
              <strong className="text-ink">{total}</strong> rows
            </span>
            <span>
              Notice-eligible: <strong className="text-ink">{noticeCount}</strong>
            </span>
            {Object.entries(flags).map(([k, v]) => (
              <span key={k} className="font-mono text-xs">
                {k}: {v}
              </span>
            ))}
          </div>

          <div className="overflow-x-auto border border-line bg-white/80">
            <table className="w-full min-w-[980px] text-left text-xs">
              <thead className="border-b border-line font-mono uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-3 py-2">Worker</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">Period</th>
                  <th className="px-3 py-2">Source</th>
                  {MONTH_LABELS.map((m) => (
                    <th key={m} className="px-2 py-2">
                      {m}
                    </th>
                  ))}
                  <th className="px-3 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-line/60">
                    <td className="px-3 py-2">
                      <p className="text-ink">{row.employeeName}</p>
                      <p className="font-mono text-[10px] text-muted">
                        {row.employeeId}
                      </p>
                    </td>
                    <td className="px-3 py-2 text-muted">
                      {companyName(row.companyId)}
                    </td>
                    <td className="px-3 py-2 font-mono">{row.period}</td>
                    <td className="px-3 py-2">
                      <SourceBadge source={row.source} />
                    </td>
                    {row.months.map((m, i) => (
                      <td
                        key={i}
                        className={`px-2 py-2 font-mono ${
                          typeof m === "string" ? "text-hist" : "text-ink"
                        }`}
                      >
                        {formatMonth(m)}
                      </td>
                    ))}
                    <td className="px-3 py-2 font-mono">
                      {typeof row.total === "number"
                        ? row.total.toFixed(2)
                        : row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
