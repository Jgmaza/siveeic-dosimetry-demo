# Dose Ledger Demo (SIVEEIC-inspired)

Sanitized portfolio demo focused on **Excel dosimetry mass load**, plus unified ledger consult — inspired by SIVEEIC Angular upload + Consultar.

- **Stack:** Vite + React + TypeScript + Tailwind + MSW
- **Primary flow:** `/upload` — period → drop Excel → validate → error file → Guardar (mock)
- **Secondary:** unified ledger, dual-write preview, reports
- **No real backends**, workers, or institutional hosts

## Local

```bash
npm install
npm run dev
```

Accounts (password `demo1234`):

- `admin@dose-ledger.dev` — can upload + full ledger
- `consult@dose-ledger.dev` — ledger scoped; upload forbidden

## Live

https://siveeic-dosimetry-demo.vercel.app
