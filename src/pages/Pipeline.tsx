import { useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

type Step = {
  label: string;
  detail: string;
  payload: unknown;
};

export function Pipeline() {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState("1002003999");
  const [period, setPeriod] = useState("2025");
  const [jan, setJan] = useState(0.11);
  const [steps, setSteps] = useState<Step[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ steps: Step[] }>("/api/pipeline/preview", {
        method: "POST",
        body: JSON.stringify({ employeeId, period, jan }),
      });
      setSteps(res.steps);
    } catch (err) {
      setSteps([]);
      setError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl text-ink">Dual-write pipeline</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Admin-only preview of how a typed NUEVO intake lands in the unified
          projection without erasing HISTORICO rows. Consultant accounts get 403
          — that is the RBAC story.
        </p>
      </div>

      {user?.role !== "admin" ? (
        <div className="border border-amber-700/30 bg-amber-50 p-4 text-sm text-amber-950">
          Signed in as <strong>{user?.role}</strong>. Switch to{" "}
          <code>admin@dose-ledger.dev</code> to run the dual-write preview.
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="grid gap-4 border border-line bg-white/75 p-5 sm:grid-cols-4"
      >
        <label className="text-sm sm:col-span-2">
          <span className="text-muted">Employee ID</span>
          <input
            className="mt-1 w-full border border-line bg-canvas px-3 py-2 font-mono"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="text-muted">Period</span>
          <input
            className="mt-1 w-full border border-line bg-canvas px-3 py-2 font-mono"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="text-muted">Jan dose</span>
          <input
            type="number"
            step="0.01"
            className="mt-1 w-full border border-line bg-canvas px-3 py-2 font-mono"
            value={jan}
            onChange={(e) => setJan(Number(e.target.value))}
          />
        </label>
        <div className="sm:col-span-4">
          <button
            type="submit"
            disabled={busy}
            className="border border-accent bg-accent px-4 py-2.5 text-sm text-canvas disabled:opacity-60"
          >
            {busy ? "Running…" : "Run dual-write preview"}
          </button>
        </div>
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="space-y-4">
        {steps.map((step) => (
          <article key={step.label} className="border border-line bg-white/80 p-5">
            <h3 className="font-display text-xl text-ink">{step.label}</h3>
            <p className="mt-1 text-sm text-muted">{step.detail}</p>
            <pre className="mt-4 overflow-x-auto border border-line/70 bg-canvas p-3 font-mono text-[11px] leading-relaxed text-ink">
              {JSON.stringify(step.payload, null, 2)}
            </pre>
          </article>
        ))}
      </div>
    </div>
  );
}
