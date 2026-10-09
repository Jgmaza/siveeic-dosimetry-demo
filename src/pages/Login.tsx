import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function Login() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("admin@dose-ledger.dev");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
        Portfolio demo
      </p>
      <h1 className="mt-2 font-display text-4xl text-ink">Dose Ledger</h1>
      <p className="mt-3 text-muted">
        Sanitized dosimetry console: unified historical + new intakes, dual-write
        preview, NR/NP flags, and role-scoped queries — all via MSW.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 border border-line bg-white/80 p-6"
      >
        <label className="block text-sm">
          <span className="text-muted">Email</span>
          <input
            className="mt-1 w-full border border-line bg-canvas px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Password</span>
          <input
            type="password"
            className="mt-1 w-full border border-line bg-canvas px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full border border-accent bg-accent px-4 py-2.5 text-sm text-canvas disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Enter console"}
        </button>
      </form>

      <div className="mt-6 space-y-2 border border-line/70 bg-white/50 p-4 text-sm text-muted">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink">
          Demo accounts · password <code>demo1234</code>
        </p>
        <ul className="space-y-1 font-mono text-xs">
          <li>admin@dose-ledger.dev — all companies + dual-write</li>
          <li>consult@dose-ledger.dev — Norte Power Co. only</li>
        </ul>
      </div>
    </div>
  );
}
