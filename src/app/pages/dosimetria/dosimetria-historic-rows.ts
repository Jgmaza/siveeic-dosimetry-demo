/** Normaliza un registro del GET reportehistoricodosimetria para la tabla ng2-smart-table. */
export function mapHistoricApiRowToTable(d: any): void {
  d.Fecha_nacimiento = d.Fecha_nacimiento_TOE;
  d.Genero_empleado = d.Genero_TOE;
  d.Nivel_educacion = d.Nivel_educacion_TOE;
  d.Titulo = d.Titulo_TOE;
  d.Nombreempleado = d.Nombres_TOE;
  d.Apellidoempleado = d.Apellidos_TOE;
  d.Nombreoperador = d.Operador;
  d.Identificacionentidad = d.Nit_Entidad;
  d.Nombreentidad = d.Nombre_Entidad;
  d.Direccionentidad = d.Direccion_Entidad;
  d.Identificacionempleado = d.Documento_TOE;
  d.Fecha_inicio_exposicion_empleado = d.Fecha_inicio_exposición_TOE;
  d.Fecha_fin_exposicion_empleado = d.Fecha_fin_exposición_TOE;
  d.Frecuencia_medicion = d.Frecuencia_medición;
  d.Frecuencia_cambio = d.Modifica_frecuencia_medición;
  d.Practica_ri = d.Practica_RI;
  d.Tipo_dosimetro = d.Tipo_dosimetro;
  d.Tecnologia_dosimetro = d.Tecnologia_dosimetro;
  d.NombreMunicipio = d.Municipio_Entidad;
  d.Hp_acumulado = d.Hp_Acumulado;
}

export function sortHistoricTableRows(a: any, b: any): number {
  const ya = Number(a && a.Periodo) || 0;
  const yb = Number(b && b.Periodo) || 0;
  if (yb !== ya) {
    return yb - ya;
  }
  const opA = String((a && (a.Operador || a.Nombreoperador)) || '');
  const opB = String((b && (b.Operador || b.Nombreoperador)) || '');
  return opA.localeCompare(opB);
}

export function buildHistoricSearchUrl(
  idValue: string,
  periodoCsv: string,
  nombre: string,
  apellido: string,
): string {
  const nom = nombre != null ? String(nombre).trim() : '';
  const ape = apellido != null ? String(apellido).trim() : '';
  let url = 'reportehistoricodosimetria?identificacion=' + encodeURIComponent(idValue)
    + '&periodo=' + encodeURIComponent(periodoCsv || '');
  if (nom) {
    url += '&nombre=' + encodeURIComponent(nom);
  }
  if (ape) {
    url += '&apellido=' + encodeURIComponent(ape);
  }
  return url;
}
