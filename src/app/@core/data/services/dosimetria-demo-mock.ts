/** Fictional sample data for the portfolio dosimetry reports demo. */

export const DEMO_OPERADORES = [
  { Id: 101, Nombres: 'Lumenox Dosimetría S.A.S.' },
  { Id: 102, Nombres: 'Radiovalle Laboratorios' },
  { Id: 103, Nombres: 'Núcleo Andino Medición' },
  { Id: 104, Nombres: 'Orión Física Aplicada' },
  { Id: 105, Nombres: 'Helios Monitoreo Personal' },
  { Id: 106, Nombres: 'Cobalto Azul Services' },
  { Id: 107, Nombres: 'Pion Latam Dosimetría' },
  { Id: 108, Nombres: 'Gamma Sierra Solutions' },
  { Id: 109, Nombres: 'Atlas Ion Protect' },
  { Id: 110, Nombres: 'Vértice Rad Control' },
  { Id: 111, Nombres: 'Quasar Bioespectro' },
  { Id: 112, Nombres: 'Nova Umbral Labs' },
];

const ENTIDADES = [
  'Clínica Horizonte Norte',
  'Industrias Metalúrgicas Solum',
  'Hospital Regional El Faro',
  'Petroquímica Delta Verde',
  'Centro Oncológico Brisa',
  'Constructora Vía Alta',
  'Universidad Técnico Cordillera',
  'Planta Energía Cerro Azul',
  'Laboratorio Clínico Meridian',
  'Minera Valle Seco Ltda.',
];

const NOMBRES = ['Ana', 'Luis', 'Marta', 'Diego', 'Sofía', 'Carlos', 'Elena', 'Jorge', 'Paula', 'Andrés'];
const APELLIDOS = ['Ruiz', 'Pérez', 'Gómez', 'Díaz', 'Vargas', 'Castro', 'Moreno', 'Silva', 'Rojas', 'Navarro'];

function monthDose(seed: number, month: number): number {
  return Number((0.02 + ((seed * 17 + month * 13) % 40) / 1000).toFixed(3));
}

export function buildDemoRows(count = 48): any[] {
  const rows = [];
  for (let i = 1; i <= count; i++) {
    const op = DEMO_OPERADORES[i % DEMO_OPERADORES.length];
    const entidad = ENTIDADES[i % ENTIDADES.length];
    const periodo = 2025 - (i % 4);
    const doses = [];
    for (let m = 1; m <= 12; m++) {
      doses.push(monthDose(i, m));
    }
    const total = doses.reduce((a, b) => a + b, 0);
    rows.push({
      Id: 1000 + i,
      NombreOperador: op.Nombres,
      Operador: op.Nombres,
      Nombreentidad: entidad,
      Nombre_Entidad: entidad,
      Identificacionempleado: String(1002003000 + i * 17),
      Documento_TOE: String(1002003000 + i * 17),
      Nombreempleado: NOMBRES[i % NOMBRES.length],
      Nombres_TOE: NOMBRES[i % NOMBRES.length],
      Apellidoempleado: APELLIDOS[i % APELLIDOS.length],
      Apellidos_TOE: APELLIDOS[i % APELLIDOS.length],
      TipoDosimetro: i % 2 === 0 ? 'TLD' : 'OSL',
      Tipo_dosimetro: i % 2 === 0 ? 'TLD' : 'OSL',
      Periodo: periodo,
      hp_msv_enero: doses[0].toFixed(3),
      hp_msv_febrero: doses[1].toFixed(3),
      hp_msv_marzo: doses[2].toFixed(3),
      hp_msv_abril: doses[3].toFixed(3),
      hp_msv_mayo: doses[4].toFixed(3),
      hp_msv_junio: doses[5].toFixed(3),
      hp_msv_julio: doses[6].toFixed(3),
      hp_msv_agosto: doses[7].toFixed(3),
      hp_msv_septiembre: doses[8].toFixed(3),
      hp_msv_octubre: doses[9].toFixed(3),
      hp_msv_noviembre: doses[10].toFixed(3),
      hp_msv_diciembre: doses[11].toFixed(3),
      total_mSv: total.toFixed(3),
      hp_acumulado: (total + 0.4 + (i % 5) * 0.15).toFixed(3),
    });
  }
  return rows;
}

export function filterDemoRows(
  all: any[],
  queryParams: { [key: string]: string | number | null | undefined },
  endpoint: string,
): any[] {
  let rows = all.slice();
  const operadorIds = String(queryParams.operadorIds || '').trim();
  const periodos = String(queryParams.periodos || '').trim();

  if (operadorIds) {
    const ids = operadorIds.split(',').map((x) => Number(x)).filter((n) => !isNaN(n));
    if (ids.length) {
      const names = DEMO_OPERADORES.filter((o) => ids.indexOf(o.Id) >= 0).map((o) => o.Nombres);
      rows = rows.filter((r) => names.indexOf(r.NombreOperador) >= 0);
    }
  }

  if (periodos) {
    const years = periodos.split(',').map((x) => Number(x)).filter((n) => !isNaN(n));
    if (years.length) {
      rows = rows.filter((r) => years.indexOf(Number(r.Periodo)) >= 0);
    }
  }

  const parts = String(endpoint).split('/');
  const docIdx = parts.indexOf('reportedosimetria');
  if (docIdx >= 0 && parts.length > docIdx + 5) {
    const doc = decodeURIComponent(parts[docIdx + 5] || '0');
    if (doc && doc !== '0') {
      rows = rows.filter((r) => String(r.Identificacionempleado).indexOf(doc) >= 0);
    }
  }

  return rows;
}

export function demoReportResponse(
  endpoint: string,
  queryParams: { [key: string]: string | number | null | undefined } = {},
) {
  const page = Number(queryParams.page || 1);
  const pageSize = Number(queryParams.pageSize || 20);
  const all = filterDemoRows(buildDemoRows(48), queryParams, endpoint);
  const start = (page - 1) * pageSize;
  return {
    data: all.slice(start, start + pageSize),
    total: all.length,
    page,
    pageSize,
  };
}
