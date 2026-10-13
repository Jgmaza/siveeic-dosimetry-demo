import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { CAPABILITIES } from "../mock/db";

type Capability = (typeof CAPABILITIES)[number];

export function Overview() {
  const [caps, setCaps] = useState<Capability[]>([]);

  useEffect(() => {
    api<Capability[]>("/api/capabilities")
      .then(setCaps)
      .catch(() => setCaps(CAPABILITIES));
  }, []);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-3xl text-ink">
          Why unify dosimetry?
        </h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
          Historical Excel loads and new typed intakes lived under different
          contracts. Operators needed one Consultar surface, honest month flags
          (NR / NP), dual-write without destroying history, and reports that
          reuse the same ledger — across Angular UI, Node API, and SQL Server
          procedures in the real stack.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/upload"
            className="border border-accent bg-accent px-4 py-2 text-sm text-canvas"
          >
            Carga dosimétrica (Excel)
          </Link>
          <Link
            to="/ledger"
            className="border border-line bg-white/70 px-4 py-2 text-sm text-ink"
          >
            Ledger unificado
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {caps.map((cap) => (
          <article key={cap.id} className="border border-line bg-white/75 p-5">
            <h3 className="font-display text-xl text-ink">{cap.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{cap.body}</p>
          </article>
        ))}
      </section>

      <section className="border border-line bg-white/60 p-5">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          Stack story (real work → this demo)
        </h3>
        <pre className="mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-ink">{`Angular front (admin / consultant)
  → Node API (query + load endpoints)
  → SQL Server SPs (unified + dual-write)
  → This demo: MSW mocks of the same UX contracts`}</pre>
      </section>
    </div>
  );
}
