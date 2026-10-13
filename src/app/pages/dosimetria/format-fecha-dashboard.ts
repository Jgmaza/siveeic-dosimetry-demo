/**
 * HU-012 / HU-4: formato de fechas dashboard dd-MMM-aaaa (ej. 10-Abr-2026).
 * Sentinelas: vacío / "No reporta" / N/A → NR. NP se respeta (no se convierte).
 */
const MESES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/** Vacío o etiqueta larga legacy → unificar a NR. NP no entra aquí. */
function esSentinelNr(value: any): boolean {
  if (value == null || value === '') return true;
  const u = String(value).trim().toUpperCase();
  return u === 'NR' || u === 'NO REPORTA' || u === 'N/A' || u === 'NA';
}

/** Uniforma vacío / NR / "No reporta" → NR. Deja NP, ND, DNL y valores reales intactos. */
export function formatNoReporta(value: any): string {
  if (esSentinelNr(value)) return 'NR';
  return String(value);
}

/** 0 / 0.00 → ND; vacío/"No reporta" → NR; NP/ND/DNL se respetan. */
export function formatDosisHistorico(value: any): string {
  if (esSentinelNr(value)) return 'NR';
  if (value === 'ND' || value === 'DNL' || value === 'nd' || value === 'dnl' || value === 'NP' || value === 'np') {
    return String(value).toUpperCase();
  }
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  if (!Number.isNaN(n) && n === 0) return 'ND';
  return value == null ? 'NR' : String(value);
}

/** Total mSv / Hp acumulado: 0 → 0,00 (nunca ND). */
export function formatDosisTotal(value: any): string {
  if (esSentinelNr(value)) return 'NR';
  const up = String(value).trim().toUpperCase();
  if (up === 'NP' || up === 'ND' || up === 'DNL') return up;
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  if (Number.isNaN(n)) return 'NR';
  return n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatFechaDashboard(value: any, momentFn?: any): string {
  if (esSentinelNr(value)) {
    return 'NR';
  }
  if (String(value).trim().toUpperCase() === 'NP') {
    return 'NP';
  }

  const raw = String(value).trim();

  // yyyy-mm-dd sin desfase de zona
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const yyyy = iso[1];
    const mm = parseInt(iso[2], 10);
    const dd = iso[3];
    const mmm = MESES_ES[mm - 1];
    if (mmm) return `${dd}-${mmm}-${yyyy}`;
  }

  if (momentFn) {
    const date = momentFn(value);
    if (!date.isValid()) return formatNoReporta(value);
    const dd = date.format('DD');
    const mmm = MESES_ES[date.month()] || date.format('MMM');
    const yyyy = date.format('YYYY');
    return `${dd}-${mmm}-${yyyy}`;
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return formatNoReporta(value);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mmm = MESES_ES[d.getUTCMonth()];
  const yyyy = d.getUTCFullYear();
  return `${dd}-${mmm}-${yyyy}`;
}
