/**
 * HU-10 §3.2.1.1 / §3.2.1.2 / §4.2 — Umbrales de alerta (texto rojo).
 *
 * Formato de ingesta (36 cols):
 *   T  = Tipo_dosimetro
 *   V–AG = Hp_mSv_Enero … Hp_mSv_Diciembre
 *   AH = Hp_Acumulado
 *
 * | Si Columna T indica… | Umbral V–AG | Umbral AH | Resultado |
 * | Cuerpo Entero        | ≥ 12 mSv    | ≥ 50 mSv  | Texto rojo |
 * | Cristalino           | ≥ 12 mSv    | ≥ 50 mSv  | Texto rojo |
 * | Extremidades         | ≥ 300 mSv   | ≥ 500 mSv | Texto rojo |
 * | [SIN INFORMACIÓN]    | ≥ 12 mSv    | ≥ 50 mSv  | Texto rojo (default §3.2.1.2) |
 */

export type CategoriaEstudio = 'Cuerpo Entero' | 'Cristalino' | 'Extremidades';
export type ClaseUmbral = 'mensual' | 'anual';

export interface UmbralesCategoria {
  mensual: number;
  anual: number;
}

const UMBRALES: { [K in CategoriaEstudio]: UmbralesCategoria } = {
  'Cuerpo Entero': { mensual: 12, anual: 50 },
  Cristalino: { mensual: 12, anual: 50 },
  Extremidades: { mensual: 300, anual: 500 },
};

/** Col. V–AG del formato de ingesta. */
export const COLUMNAS_DOSIS_MENSUAL = [
  'Hp_mSv_Enero',
  'Hp_mSv_Febrero',
  'Hp_mSv_Marzo',
  'Hp_mSv_Abril',
  'Hp_mSv_Mayo',
  'Hp_mSv_Junio',
  'Hp_mSv_Julio',
  'Hp_mSv_Agosto',
  'Hp_mSv_Septiembre',
  'Hp_mSv_Octubre',
  'Hp_mSv_Noviembre',
  'Hp_mSv_Diciembre',
];

/** Col. AH del formato = Hp_Acumulado. Total_mSv se trata igual en modal/UI. */
export const COLUMNAS_DOSIS_ANUAL = ['Hp_Acumulado', 'Hp_acumulado', 'Total_mSv'];

/** Orden de columnas del Formato_Reporte_Dosimetria.xlsx (A–AJ). */
export const COLUMNAS_FORMATO_INGESTA_36 = [
  'Nit_Entidad',
  'Nombre_Entidad',
  'Municipio_Entidad',
  'Codigo_Municipio',
  'Codigo_Departamento',
  'Direccion_Entidad',
  'Correo_Entidad',
  'Documento_Trabajador',
  'Nombres_Trabajador',
  'Apellidos_Trabajador',
  'Fecha_nacimiento_Trabajador',
  'Genero_Trabajador',
  'Nivel_educacion_Trabajador',
  'Titulo_Trabajador',
  'Fecha_inicio_exposicion_Trabajador',
  'Fecha_fin_exposicion_Trabajador',
  'Frecuencia_medicion',
  'Modifica_frecuencia_medicion',
  'Practica_RI',
  'Tipo_dosimetro', // Columna T
  'Tecnologia_dosimetro',
  'Hp_mSv_Enero', // V
  'Hp_mSv_Febrero',
  'Hp_mSv_Marzo',
  'Hp_mSv_Abril',
  'Hp_mSv_Mayo',
  'Hp_mSv_Junio',
  'Hp_mSv_Julio',
  'Hp_mSv_Agosto',
  'Hp_mSv_Septiembre',
  'Hp_mSv_Octubre',
  'Hp_mSv_Noviembre',
  'Hp_mSv_Diciembre', // AG
  'Hp_Acumulado', // AH
  'Observaciones_dosis_notificacion',
  'Observaciones_generales',
];

export function resolverCategoriaEstudio(tipo: string | null | undefined): CategoriaEstudio {
  // §3.2.1.2: sin información → Cuerpo Entero
  if (tipo == null || String(tipo).trim() === '') {
    return 'Cuerpo Entero';
  }
  const t = String(tipo).trim();
  const upper = t.toUpperCase();
  if (
    upper === 'NR' || upper === 'NP' || upper === 'N/A' || upper === 'NA'
    || upper === 'SIN INFORMACION' || upper === 'SIN INFORMACIÓN'
    || upper === '[SIN INFORMACIÓN]' || upper === '[SIN INFORMACION]'
  ) {
    return 'Cuerpo Entero';
  }
  const lower = t.toLowerCase();
  if (lower.includes('cristalino') || t.includes('Hp(3)')) {
    return 'Cristalino';
  }
  if (
    lower.includes('extremidad')
    || lower.includes('piel')
    || t.includes('Hp(0.07)')
  ) {
    return 'Extremidades';
  }
  return 'Cuerpo Entero';
}

export function umbralesParaTipo(tipo: string | null | undefined): UmbralesCategoria {
  return UMBRALES[resolverCategoriaEstudio(tipo)];
}

export function resolverTipoDosimetro(tipo: string | null | undefined): string {
  return resolverCategoriaEstudio(tipo);
}

export function umbralAnualParaTipo(tipo: string | null | undefined): number {
  return umbralesParaTipo(tipo).anual;
}

export function valorNumericoHp(value: any): number | null {
  if (value == null || value === '') { return null; }
  const upper = String(value).trim().toUpperCase();
  if (['NR', 'ND', 'NP', 'DNL', 'N/A', 'NA'].includes(upper)) { return null; }
  // Soporta "12,50" y "1.234,56" (es-CO)
  let s = String(value).trim().replace(/\s/g, '');
  if (s.indexOf(',') >= 0 && s.indexOf('.') >= 0) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else {
    s = s.replace(',', '.');
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/** §3.2.1.1: ≥ umbral → texto rojo. mensual=V–AG, anual=AH. */
export function superaUmbral(
  value: any,
  tipoEstudio: string | null | undefined,
  clase: ClaseUmbral = 'mensual',
): boolean {
  const n = valorNumericoHp(value);
  if (n == null) { return false; }
  const u = umbralesParaTipo(tipoEstudio);
  const limite = clase === 'anual' ? u.anual : u.mensual;
  return n >= limite;
}

/** Columna T / Tipo_dosimetro desde fila de export o API. */
export function tipoEstudioDesdeFila(row: any): string {
  if (!row) { return ''; }
  const t = row.Tipo_dosimetro != null ? row.Tipo_dosimetro
    : (row.TipoDosimetro != null ? row.TipoDosimetro
      : (row.Tipo_dosimetro_nombre != null ? row.Tipo_dosimetro_nombre : ''));
  if (t && typeof t === 'object') {
    return t.Nombre || t.nombre || '';
  }
  return t != null ? String(t) : '';
}
