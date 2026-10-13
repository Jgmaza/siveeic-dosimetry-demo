import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const links = [
  { to: "/", label: "Overview" },
  { to: "/upload", label: "Carga Excel" },
  { to: "/ledger", label: "Ledger unificado" },
  { to: "/pipeline", label: "Dual-write" },
  { to: "/reports", label: "Reportes" },
];

export function Shell() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-line/80 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
              Portfolio demo · sanitized
            </p>
            <h1 className="font-display text-xl text-ink">Dose Ledger</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
            <span>
              {user?.name} ·{" "}
              <span className="font-mono uppercase">{user?.role}</span>
            </span>
            <button
              type="button"
              onClick={logout}
              className="border border-line px-3 py-1.5 hover:border-accent hover:text-accent"
            >
              Log out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `whitespace-nowrap border px-3 py-1.5 text-sm ${
                  isActive
                    ? "border-accent bg-accent text-canvas"
                    : "border-transparent text-muted hover:border-line hover:text-ink"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-line/70 py-6 text-center text-xs text-muted">
        Inspired by energy-surveillance dosimetry work. Fictional workers and
        companies — no institutional hosts or real IDs.
      </footer>
    </div>
  );
}
