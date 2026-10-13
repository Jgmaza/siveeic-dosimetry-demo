export type Role = "admin" | "consultant";

export type DoseSource = "HISTORICO" | "NUEVO" | "UNIFICADO";

export type MonthFlag = number | "NR" | "NP" | "ND";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  password: string;
  companyIds: string[];
};

export type Company = {
  id: string;
  name: string;
  kind: "conventional" | "non_conventional";
};

export type DoseRow = {
  id: string;
  employeeId: string;
  employeeName: string;
  companyId: string;
  period: string;
  source: DoseSource;
  months: MonthFlag[];
  total: number | "NR" | "NP";
  noticeEligible: boolean;
};

export const DEMO_USERS: User[] = [
  {
    id: "u-admin",
    email: "admin@dose-ledger.dev",
    name: "Ana Admin",
    role: "admin",
    password: "demo1234",
    companyIds: ["c-norte", "c-valley", "c-solar"],
  },
  {
    id: "u-consult",
    email: "consult@dose-ledger.dev",
    name: "Carlos Consultant",
    role: "consultant",
    password: "demo1234",
    companyIds: ["c-norte"],
  },
];

export const COMPANIES: Company[] = [
  { id: "c-norte", name: "Norte Power Co.", kind: "conventional" },
  { id: "c-valley", name: "Valley Grid Ops", kind: "conventional" },
  { id: "c-solar", name: "Solar Ridge Energy", kind: "non_conventional" },
];

export const PERIODS = ["2025", "2024", "2023"];

/** Fictional workers — no real IDs */
export const DOSE_ROWS: DoseRow[] = [
  {
    id: "r1",
    employeeId: "1002003001",
    employeeName: "Marta Ríos",
    companyId: "c-norte",
    period: "2025",
    source: "UNIFICADO",
    months: [0.12, 0.11, "NR", 0.14, 0.1, 0.09, "NP", 0.13, 0.12, 0.11, 0.1, 0.12],
    total: 1.14,
    noticeEligible: true,
  },
  {
    id: "r2",
    employeeId: "1002003001",
    employeeName: "Marta Ríos",
    companyId: "c-norte",
    period: "2024",
    source: "HISTORICO",
    months: [0.1, 0.1, 0.09, 0.11, "NR", 0.08, 0.1, 0.1, 0.09, 0.11, 0.1, 0.09],
    total: 1.07,
    noticeEligible: true,
  },
  {
    id: "r3",
    employeeId: "1002003044",
    employeeName: "Luis Peña",
    companyId: "c-norte",
    period: "2025",
    source: "NUEVO",
    months: [0.2, 0.18, 0.19, 0.21, 0.17, 0.16, 0.18, 0.2, 0.19, 0.18, 0.17, 0.18],
    total: 2.21,
    noticeEligible: true,
  },
  {
    id: "r4",
    employeeId: "1002003088",
    employeeName: "Elena Vargas",
    companyId: "c-valley",
    period: "2025",
    source: "UNIFICADO",
    months: ["NP", "NP", 0.05, 0.06, 0.05, "NR", 0.07, 0.06, 0.05, 0.06, 0.05, 0.06],
    total: 0.51,
    noticeEligible: false,
  },
  {
    id: "r5",
    employeeId: "1002003112",
    employeeName: "Diego Soto",
    companyId: "c-solar",
    period: "2025",
    source: "NUEVO",
    months: [0.03, 0.04, 0.03, 0.04, 0.03, 0.04, 0.03, 0.04, 0.03, 0.04, 0.03, 0.04],
    total: 0.42,
    noticeEligible: true,
  },
  {
    id: "r6",
    employeeId: "1002003112",
    employeeName: "Diego Soto",
    companyId: "c-solar",
    period: "2024",
    source: "HISTORICO",
    months: [0.02, 0.03, 0.02, 0.03, 0.02, 0.03, 0.02, 0.03, 0.02, 0.03, 0.02, 0.03],
    total: 0.3,
    noticeEligible: true,
  },
  {
    id: "r7",
    employeeId: "1002003200",
    employeeName: "Paula Méndez",
    companyId: "c-valley",
    period: "2023",
    source: "HISTORICO",
    months: ["NR", "NR", "NR", 0.08, 0.07, 0.08, 0.07, 0.08, 0.07, 0.08, 0.07, 0.08],
    total: 0.68,
    noticeEligible: false,
  },
  {
    id: "r8",
    employeeId: "1002003255",
    employeeName: "Andrés Quiroga",
    companyId: "c-norte",
    period: "2025",
    source: "UNIFICADO",
    months: [0.15, 0.14, 0.16, 0.15, 0.14, 0.15, 0.16, 0.15, 0.14, 0.15, 0.14, 0.15],
    total: 1.78,
    noticeEligible: true,
  },
];

export const CAPABILITIES = [
  {
    id: "excel",
    title: "Excel mass load",
    body: "Same flow as SIVEEIC: pick period, drop Excel/CSV, validate with error file, then Guardar into the unified ledger (mocked).",
  },
  {
    id: "unify",
    title: "Unified ledger",
    body: "Historical Excel loads and new intakes share one Consultar grid — HISTORICO / NUEVO / UNIFICADO badges.",
  },
  {
    id: "dual",
    title: "Dual-write sync",
    body: "New loads write as NUEVO and project to unified; historical rows stay readable.",
  },
  {
    id: "flags",
    title: "Honest month flags",
    body: "NR / NP / ND stay distinct from numeric doses — no silent zeros.",
  },
  {
    id: "rbac",
    title: "Role scopes",
    body: "Admin uploads and filters across companies; consultant is scoped and cannot commit mass loads.",
  },
];

export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function companyName(id: string) {
  return COMPANIES.find((c) => c.id === id)?.name ?? id;
}
