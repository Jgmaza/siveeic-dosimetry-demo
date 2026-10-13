import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { superaUmbral, tipoEstudioDesdeFila, valorNumericoHp } from '../dosimetria-umbrales.util';

const MESES = [
  { key: 'Hp_mSv_Enero', label: 'Enero' },
  { key: 'Hp_mSv_Febrero', label: 'Febrero' },
  { key: 'Hp_mSv_Marzo', label: 'Marzo' },
  { key: 'Hp_mSv_Abril', label: 'Abril' },
  { key: 'Hp_mSv_Mayo', label: 'Mayo' },
  { key: 'Hp_mSv_Junio', label: 'Junio' },
  { key: 'Hp_mSv_Julio', label: 'Julio' },
  { key: 'Hp_mSv_Agosto', label: 'Agosto' },
  { key: 'Hp_mSv_Septiembre', label: 'Septiembre' },
  { key: 'Hp_mSv_Octubre', label: 'Octubre' },
  { key: 'Hp_mSv_Noviembre', label: 'Noviembre' },
  { key: 'Hp_mSv_Diciembre', label: 'Diciembre' },
];

function pick(...values: any[]): any {
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v != null && v !== '') { return v; }
  }
  return null;
}

function cellText(value: any): any {
  if (value == null || value === '') { return null; }
  if (typeof value === 'object') {
    return value.Nombreoperador || value.Nombres || value.Nombre
      || value.NombreDepartamento || value.NombreMunicipio
      || value.NombreEstado || value.NombreCiclo || null;
  }
  return value;
}

@Component({
  selector: 'app-dosimetria-detalle-modal',
  templateUrl: './dosimetria-detalle-modal.component.html',
  styleUrls: ['./dosimetria-detalle-modal.component.scss'],
})
export class DosimetriaDetalleModalComponent implements OnInit {
  @Input() registro: any;

  datosGenerales: Array<{ label: string; value: any; alerta?: boolean }> = [];
  mesesHp: Array<{ label: string; value: any; alerta: boolean }> = [];
  tipoDosimetro = '';

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    if (!this.registro) { return; }
    const r = this.registro;
    const rep = r.Reportedosimetria || {};
    const op = r.Operador || {};
    const depto = r.Departamento || {};
    const mun = r.Municipio || {};

    this.tipoDosimetro = tipoEstudioDesdeFila({
      TipoDosimetro: r.TipoDosimetro,
      Tipo_dosimetro: pick(r.Tipo_dosimetro, cellText(rep.Tipo_dosimetro)),
    });

    // HU-10 §4.1: solo campos con información (barrido datos generales).
    this.datosGenerales = [
      { label: 'Empresa dosimetría', value: pick(r.NombreOperador, r.Nombreoperador, op.Nombreoperador, op.Nombres, r.Operador) },
      { label: 'Periodo', value: r.Periodo },
      { label: 'Ciclo', value: cellText(r.Ciclo) },
      { label: 'NIT entidad', value: pick(r.Identificacionentidad, r.Nit_Entidad) },
      { label: 'Entidad contratante', value: pick(r.Nombreentidad, r.Nombre_Entidad) },
      { label: 'Departamento', value: pick(depto.NombreDepartamento, r.Codigo_Departamento) },
      { label: 'Municipio', value: pick(mun.NombreMunicipio, mun.Codigo) },
      { label: 'Dirección entidad', value: r.Direccionentidad },
      { label: 'Correo entidad', value: r.Correoentidad },
      { label: 'Documento trabajador', value: pick(r.Identificacionempleado, r.Documento_TOE) },
      { label: 'Nombre', value: pick(r.Nombreempleado, r.Nombres_TOE) },
      { label: 'Apellido', value: pick(r.Apellidoempleado, r.Apellidos_TOE) },
      { label: 'Fecha nacimiento', value: pick(r.Fecha_nacimiento, r.fecha_nacimiento) },
      { label: 'Género', value: r.Genero_empleado },
      { label: 'Nivel educación', value: r.Nivel_educacion },
      { label: 'Título', value: r.Titulo },
      { label: 'Inicio exposición', value: pick(r.Fecha_inicio_exposicion_empleado, r.fecha_inicio_exposicion) },
      { label: 'Fin exposición', value: pick(r.Fecha_fin_exposicion_empleado, r.fecha_fin_exposicion) },
      { label: 'Frecuencia medición', value: pick(r.Frecuencia_medicion, r.FrecuenciaMedicion) },
      { label: 'Modifica frecuencia', value: pick(r.Frecuencia_cambio, r.frecuencia_cambio) },
      { label: 'Práctica RI', value: pick(r.Practica_ri, r.PracticaRI) },
      { label: 'Tipo dosímetro', value: this.tipoDosimetro },
      { label: 'Tecnología dosímetro', value: pick(r.Tecnologia_dosimetro, r.TecnologiaDosimetro) },
      { label: 'Total mSv', value: pick(r.Total_mSv, r.total_mSv, rep.Total_mSv) },
      { label: 'Hp acumulado', value: pick(r.Hp_acumulado, r.Hp_Acumulado, r.hp_acumulado, rep.Hp_acumulado) },
      { label: 'Latitud', value: r.Latitud },
      { label: 'Longitud', value: r.Longitud },
      { label: 'Estado reporte', value: cellText(r.Estadoreporte) },
      { label: 'Fecha creación', value: r.Fechacreacion },
    ].filter((d) => d.value != null && d.value !== '');

    // §4.2: meses = umbral V–AG (mensual); Total/Hp en datos generales usan umbral AH.
    this.mesesHp = MESES.map((m) => {
      const val = rep[m.key] != null ? rep[m.key] : r[m.key];
      return {
        label: m.label,
        value: val,
        alerta: superaUmbral(val, this.tipoDosimetro, 'mensual'),
      };
    });

    // Marcar Total / Hp acumulado en rojo si superan umbral anual (AH).
    this.datosGenerales = this.datosGenerales.map((d) => {
      if (d.label === 'Total mSv' || d.label === 'Hp acumulado') {
        return {
          label: d.label,
          value: d.value,
          alerta: superaUmbral(d.value, this.tipoDosimetro, 'anual'),
        };
      }
      return d;
    });
  }

  displayValue(value: any): string {
    if (value == null || value === '') { return '—'; }
    return String(value);
  }

  esAlerta(value: any): boolean {
    return superaUmbral(value, this.tipoDosimetro, 'mensual');
  }

  totalCalculado(): number | null {
    let sum = 0;
    let has = false;
    for (const m of this.mesesHp) {
      const n = valorNumericoHp(m.value);
      if (n != null) {
        sum += n;
        has = true;
      }
    }
    return has ? parseFloat(sum.toFixed(4)) : null;
  }
}
