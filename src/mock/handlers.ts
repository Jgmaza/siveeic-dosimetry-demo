import { http, HttpResponse } from "msw";
import {
  CAPABILITIES,
  COMPANIES,
  DEMO_USERS,
  DOSE_ROWS,
  PERIODS,
  type DoseRow,
  type Role,
} from "./db";

type Session = {
  token: string;
  userId: string;
  role: Role;
  companyIds: string[];
  name: string;
  email: string;
};

const sessions = new Map<string, Session>();

function auth(request: Request): Session | null {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return sessions.get(header.slice(7)) ?? null;
}

function scopedRows(session: Session, rows: DoseRow[]) {
  if (session.role === "admin") return rows;
  return rows.filter((r) => session.companyIds.includes(r.companyId));
}

export const handlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    const user = DEMO_USERS.find(
      (u) => u.email === body.email && u.password === body.password,
    );
    if (!user) {
      return HttpResponse.json({ detail: "Invalid credentials." }, { status: 401 });
    }
    const token = `demo.${user.id}.${crypto.randomUUID()}`;
    sessions.set(token, {
      token,
      userId: user.id,
      role: user.role,
      companyIds: user.companyIds,
      name: user.name,
      email: user.email,
    });
    return HttpResponse.json({
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyIds: user.companyIds,
      },
    });
  }),

  http.get("/api/me", ({ request }) => {
    const session = auth(request);
    if (!session) {
      return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json({
      id: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
      companyIds: session.companyIds,
    });
  }),

  http.get("/api/capabilities", () => HttpResponse.json(CAPABILITIES)),

  http.get("/api/meta", ({ request }) => {
    const session = auth(request);
    if (!session) {
      return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }
    const companies =
      session.role === "admin"
        ? COMPANIES
        : COMPANIES.filter((c) => session.companyIds.includes(c.id));
    return HttpResponse.json({ companies, periods: PERIODS });
  }),

  http.get("/api/doses", ({ request }) => {
    const session = auth(request);
    if (!session) {
      return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const company = url.searchParams.getAll("company");
    const period = url.searchParams.getAll("period");
    const employeeId = url.searchParams.get("employeeId")?.trim() ?? "";
    const source = url.searchParams.getAll("source");
    const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";

    let rows = scopedRows(session, DOSE_ROWS);

    if (company.length) {
      rows = rows.filter((r) => company.includes(r.companyId));
    }
    if (period.length) {
      rows = rows.filter((r) => period.includes(r.period));
    }
    if (source.length) {
      rows = rows.filter((r) => source.includes(r.source));
    }
    if (employeeId) {
      rows = rows.filter((r) => r.employeeId.includes(employeeId));
    }
    if (q) {
      rows = rows.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(q) ||
          r.employeeId.includes(q),
      );
    }

    rows = [...rows].sort((a, b) => {
      if (a.period === b.period) return a.employeeName.localeCompare(b.employeeName);
      return b.period.localeCompare(a.period);
    });

    return HttpResponse.json({
      total: rows.length,
      rows,
      flags: {
        NR: "Not reported for the month",
        NP: "Worker not present / not applicable",
        ND: "Not defined in source contract",
      },
    });
  }),

  http.post("/api/pipeline/preview", async ({ request }) => {
    const session = auth(request);
    if (!session) {
      return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "admin") {
      return HttpResponse.json(
        { detail: "Only admin can run dual-write preview." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      employeeId?: string;
      period?: string;
      jan?: number;
    };

    const employeeId = body.employeeId?.trim() || "1002003999";
    const period = body.period || "2025";
    const jan = Number.isFinite(body.jan) ? Number(body.jan) : 0.11;

    return HttpResponse.json({
      steps: [
        {
          label: "1. Typed intake (NUEVO)",
          detail: "Admin uploads/enters a typed monthly dose row for the open period.",
          payload: {
            employeeId,
            period,
            source: "NUEVO",
            months: { Jan: jan },
          },
        },
        {
          label: "2. Dual-write",
          detail:
            "API writes into the new store and syncs a unified projection (SP + dual-write).",
          payload: {
            write_nuevo: true,
            sync_unificado: true,
            preserve_historico: true,
          },
        },
        {
          label: "3. Unified query",
          detail:
            "Consultar hits the unified SP with multi-filters. Historical rows remain available with source HISTORICO.",
          payload: {
            endpoint: "GET /api/doses?period=2025&source=UNIFICADO",
            total_preview: 1,
            row: {
              employeeId,
              period,
              source: "UNIFICADO",
              Jan: jan,
              note: "Numeric months stay numeric; NR/NP never coerced to 0.",
            },
          },
        },
        {
          label: "4. Report / notice hooks",
          detail:
            "Same ledger feeds report filters and worker-anchored notice selection.",
          payload: {
            report: "HU-style multi-filter export preview",
            notice_anchor: employeeId,
          },
        },
      ],
    });
  }),

  http.post("/api/upload/validate", async ({ request }) => {
    const session = auth(request);
    if (!session) {
      return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "admin") {
      return HttpResponse.json(
        { detail: "Only admin can upload dosimetry files." },
        { status: 403 },
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    const period =
      (typeof form.get("period") === "string" && form.get("period")) || "2025";
    const fileName =
      file && typeof file === "object" && "name" in file
        ? String((file as File).name)
        : "dosimetria-demo.xlsx";

    await new Promise((r) => setTimeout(r, 450));

    const totalRows = 128;
    const errors = [
      { row: 12, field: "documento", message: "documento vacío" },
      { row: 28, field: "mes_3", message: "dosis mes 3 no numérica" },
      { row: 41, field: "operador", message: "operador no reconocido" },
      { row: 55, field: "periodo", message: "periodo no coincide con el seleccionado" },
      { row: 67, field: "mes_7", message: "flag inválido (use NR/NP o número)" },
      { row: 89, field: "documento", message: "formato de documento inválido" },
      { row: 104, field: "empresa", message: "empresa fuera del alcance del usuario" },
    ];
    const errorRows = errors.length;
    const okRows = totalRows - errorRows;

    return HttpResponse.json({
      fileName,
      period,
      totalRows,
      okRows,
      errorRows,
      errors,
      dualWriteNote:
        "Al guardar, las filas OK se escriben como NUEVO y se proyectan al ledger unificado; HISTORICO no se sobrescribe (mock).",
    });
  }),

  http.post("/api/upload/commit", async ({ request }) => {
    const session = auth(request);
    if (!session) {
      return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "admin") {
      return HttpResponse.json(
        { detail: "Only admin can commit dosimetry uploads." },
        { status: 403 },
      );
    }

    const form = await request.formData();
    const period =
      (typeof form.get("period") === "string" && form.get("period")) || "2025";
    const okRowsRaw = form.get("okRows");
    const inserted = Number(okRowsRaw) || 121;
    const file = form.get("file");
    const fileName =
      file && typeof file === "object" && "name" in file
        ? String((file as File).name)
        : "dosimetria-demo.xlsx";

    await new Promise((r) => setTimeout(r, 500));

    return HttpResponse.json({
      inserted,
      period,
      fileName,
      source: "NUEVO",
      filesForOperatorPeriod: 3,
      filesInSystem: 47,
      message: `Se insertaron ${inserted} registros en el ledger unificado (demo).`,
    });
  }),

  http.get("/api/reports/preview", ({ request }) => {
    const session = auth(request);
    if (!session) {
      return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(request.url);
    const period = url.searchParams.get("period") || "2025";
    const rows = scopedRows(session, DOSE_ROWS).filter((r) => r.period === period);
    const numericTotals = rows
      .map((r) => (typeof r.total === "number" ? r.total : 0))
      .filter((n) => n > 0);

    return HttpResponse.json({
      period,
      workers: rows.length,
      avgTotal:
        numericTotals.length === 0
          ? 0
          : Number(
              (
                numericTotals.reduce((a, b) => a + b, 0) / numericTotals.length
              ).toFixed(2),
            ),
      bySource: {
        HISTORICO: rows.filter((r) => r.source === "HISTORICO").length,
        NUEVO: rows.filter((r) => r.source === "NUEVO").length,
        UNIFICADO: rows.filter((r) => r.source === "UNIFICADO").length,
      },
      sample: rows.slice(0, 5),
    });
  }),
];
