import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { companyName, type DoseRow } from "../mock/db";

type Report = {
  period: string;
  workers: number;
  avgTotal: number;
  bySource: Record<string, number>;
  sample: DoseRow[];
};

export function Reports() {
  const [period, setPeriod] = useState("2025");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load(next = period) {
    setBusy(true);
    setError(null);
    try {
      const res = await api<Report>(
        `/api/reports/preview?period=${encodeURIComponent(next)}`,
      );
      setReport(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Report failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load("2025");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl text-ink">Reports preview</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Multi-filter style summary over the same unified ledger. Scoped by role
          (consultant only sees assigned companies).
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="text-muted">Period</span>
          <select
            className="mt-1 block border border-line bg-white px-3 py-2"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {["2025", "2024", "2023"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => load(period)}
          className="border border-accent bg-accent px-4 py-2 text-sm text-canvas disabled:opacity-60"
        >
          {busy ? "Loading…" : "Refresh report"}
        </button>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {report ? (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Period" value={report.period} />
            <Stat label="Workers" value={String(report.workers)} />
            <Stat label="Avg total" value={report.avgTotal.toFixed(2)} />
            <Stat
              label="Sources"
              value={`H ${report.bySource.HISTORICO ?? 0} · N ${report.bySource.NUEVO ?? 0} · U ${report.bySource.UNIFICADO ?? 0}`}
            />
          </div>

          <div className="overflow-x-auto border border-line bg-white/80">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-line font-mono text-[11px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Worker</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Notice</th>
                </tr>
              </thead>
              <tbody>
                {report.sample.map((row) => (
                  <tr key={row.id} className="border-b border-line/60">
                    <td className="px-4 py-3">
                      <p>{row.employeeName}</p>
                      <p className="font-mono text-xs text-muted">
                        {row.employeeId}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {companyName(row.companyId)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{row.source}</td>
                    <td className="px-4 py-3 font-mono">
                      {typeof row.total === "number"
                        ? row.total.toFixed(2)
                        : row.total}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {row.noticeEligible ? "eligible" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-white/75 p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-xl text-ink">{value}</p>
    </div>
  );
}
