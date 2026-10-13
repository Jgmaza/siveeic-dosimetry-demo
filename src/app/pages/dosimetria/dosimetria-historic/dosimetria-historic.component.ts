import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalDataSource } from 'ng2-smart-table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import 'style-loader!angular2-toaster/toaster.css';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

import { DosimetriaService } from '../../../@core/data/services/dosimetria.service';
import { ExcelServicesService } from '../../../@core/data/excel-services.service';
import { DosimetriaView } from '../../../@core/data/models/dosimetria/dosimetria_view';
import { DosimetriaFormComponent } from '../dosimetria-form/dosimetria-form.component';
import { CheckboxRenderComponent } from './checkbox-render.component';
import { DosimetriaHistoricoSeleccionService } from '../dosimetria-historico-seleccion.service';
import {
  buildHistoricSearchUrl,
  mapHistoricApiRowToTable,
  sortHistoricTableRows,
} from '../dosimetria-historic-rows';

import { Periodo } from '../../../@core/data/models/general/periodo';
import { formatFechaDashboard, formatNoReporta, formatDosisHistorico, formatDosisTotal } from '../format-fecha-dashboard';

@Component({
  selector: 'app-dosimetria-historic',
  templateUrl: './dosimetria-historic.component.html',
  styleUrls: ['./dosimetria-historic.component.scss']
})
export class DosimetriaHistoricComponent implements OnInit, AfterViewInit, OnDestroy {
  user_operador: number;
  uid: number;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  excel=[];
  source: LocalDataSource = new LocalDataSource();  
  rowspage:any;
  private docEscalonSub: Subscription;
 
  filtrarForm: FormGroup;
  registroForm: FormGroup;
  /*variables para definir los selects de formulario */
  Operador = [];
  Anio = [];
  Periodo = [];
  Ciclo = [];
  Departamento = [];
  Municipio = [];


  get anchoredCedula(): string | null {
    return this.seleccion.anchoredCedula;
  }

  get selectedCount(): number {
    return this.seleccion.selectedCount;
  }

  constructor(
      private modalService: NgbModal,
      private translate: TranslateService,
      private registroService: DosimetriaService,
      private toasterService: ToasterService,
      private excelService: ExcelServicesService,
      private formBuilder: FormBuilder,
      private seleccion: DosimetriaHistoricoSeleccionService,
  ) {
    this.construirForm();
    this.loadOptionsPeriodo();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  construirForm() {
    this.filtrarForm = this.formBuilder.group({
      Operador: [null],
      Ciclo: [null],
      //Periodo: [null],
      Periodo: [[],],
      Identificacion_empleado: ['',  Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(15),
        Validators.pattern('^[0-9]+$')
      ]) ],
      // HU-10 §2.2: Nombre/Apellido se habilitan al ingresar documento (nivel 2 complementario)
      Nombre_empleado: [{ value: '', disabled: true }, Validators.compose([Validators.minLength(3), Validators.pattern('^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$')]) ],
      Apellido_empleado: [{ value: '', disabled: true }, Validators.compose([Validators.minLength(3), Validators.pattern('^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$')]) ],
      Departamento: [null],
      Municipio: [{ value: "", disabled: true }],
    });

    this.registroForm = this.formBuilder.group({
      Rowspage: [null],
    });

    this.setupBusquedaEscalonada();
  }

  /**
   * HU-10 §2.2 — Búsqueda escalonada:
   * Nivel 1: documento. Nivel 2: al ingresar documento válido se habilitan Nombre y Apellido
   * (complemento para registros con documento ausente/erróneo / NR).
   */
  private setupBusquedaEscalonada(): void {
    const idCtrl = this.filtrarForm.get('Identificacion_empleado');
    if (!idCtrl) { return; }
    this.docEscalonSub = idCtrl.valueChanges.subscribe((raw) => {
      const v = raw != null ? String(raw).trim() : '';
      const docOk = /^[0-9]{4,15}$/.test(v);
      this.setNombreApellidoEnabled(docOk);
    });
  }

  paginas(): void {
    this.rowspage=this.registroForm.get('Rowspage').value;
    this.source.setPaging(1,this.rowspage);
  }  

  cargarCampos() {
    let permiso=true;
    if(this.user_operador===0)
        {permiso=false;}

    this.settings = {
       actions: false,  
      mode: 'external',
      pager: {perPage: 15 },
      columns: {
        Seleccionar: {
          title: '✔',
          type: 'custom',
          renderComponent: CheckboxRenderComponent,
          filter: false,
          editable: false,
          addable: false,
          onComponentInitFunction: (instance) => {
            instance.save.subscribe((row) => {
              this.seleccion.syncFromRow(row);
              this.updateHeaderCheckboxState();
            });
          },
        },
        Operador: {
          title: this.translate.instant('GLOBAL.dosimetria.operador'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Periodo: {
          title: this.translate.instant('GLOBAL.dosimetria.periodo'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
          compareFunction: (direction: number, a: any, b: any) => {
            const an = Number(a) || 0;
            const bn = Number(b) || 0;
            return direction * (an - bn);
          },
        },
        Identificacionentidad: {
          title: this.translate.instant('GLOBAL.dosimetria.identificacion_entidad'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatNoReporta(value);
          },
        },
        Nombreentidad: {
          title: this.translate.instant('GLOBAL.dosimetria.nombre_entidad'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatNoReporta(value);
          },
        },
        /*Departamento: {
          title: this.translate.instant('GLOBAL.dosimetria.departamento'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Municipio: {
          title: this.translate.instant('GLOBAL.dosimetria.municipio'),
          // type: 'tipo_estado;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },*/
        Direccionentidad: {
          title: this.translate.instant('GLOBAL.dosimetria.direccion_entidad'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatNoReporta(value);
          },
        },
        Identificacionempleado: {
          title: this.translate.instant('GLOBAL.dosimetria.identificacion_empleado'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatNoReporta(value);
          },
        },
        Nombreempleado: {
          title: this.translate.instant('GLOBAL.dosimetria.nombre_empleado'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatNoReporta(value);
          },
        },
        Apellidoempleado: {
          title: this.translate.instant('GLOBAL.dosimetria.apellido_empleado'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatNoReporta(value);
          },
        },
        Fecha_nacimiento: {
          title: this.translate.instant('GLOBAL.dosimetria.fecha_nacimiento'),
          // type: 'Date;',
          valuePrepareFunction: (value) => {
            return formatFechaDashboard(value, moment);
          },
        },
        Genero_empleado: {
          title: this.translate.instant('GLOBAL.dosimetria.genero_empleado'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatNoReporta(value);
          },
        },
        Nivel_educacion: {
          title: this.translate.instant('GLOBAL.dosimetria.nivel_educacion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatNoReporta(value);
          },
        },
        Titulo: {
          title: this.translate.instant('GLOBAL.dosimetria.titulo_educacion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatNoReporta(value);
          },
        },
        Fecha_inicio_exposicion_empleado: {
          title: this.translate.instant('GLOBAL.dosimetria.fecha_inicio_exposicion_empleado'),
          // type: 'Date;',
          valuePrepareFunction: (value) => {
            return formatFechaDashboard(value, moment);
          },
        },
        Fecha_fin_exposicion_empleado: {
          title: this.translate.instant('GLOBAL.dosimetria.fecha_fin_exposicion_empleado'),
          valuePrepareFunction: (value) => {
            return formatFechaDashboard(value, moment);
          },
        },
        Frecuencia_medicion: {
          title: this.translate.instant('GLOBAL.dosimetria.frecuencia_medicion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatNoReporta(value);
          },
        },
        Frecuencia_cambio: {
          title: this.translate.instant('GLOBAL.dosimetria.frecuencia_cambio'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatNoReporta(value);
          },
        },

        Practica_ri: {
          title: this.translate.instant('GLOBAL.dosimetria.practica_ri'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatNoReporta(value);
          },
        },
        Tipo_dosimetro: {
          title: this.translate.instant('GLOBAL.dosimetria.tipo_dosimetro'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatNoReporta(value);
          },
        },
        Tecnologia_dosimetro: {
          title: this.translate.instant('GLOBAL.dosimetria.tecnologia_dosimetro'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatNoReporta(value);
          },
        },
        Hp_mSv_Enero: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Enero'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatDosisHistorico(value);
          },
        },
        Hp_mSv_Febrero: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Febrero'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatDosisHistorico(value);
          },
        },
        Hp_mSv_Marzo: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Marzo'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatDosisHistorico(value);
          },
        },
        Hp_mSv_Abril: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Abril'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatDosisHistorico(value);
          },
        },
        Hp_mSv_Mayo: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Mayo'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatDosisHistorico(value);
          },
        },
        Hp_mSv_Junio: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Junio'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatDosisHistorico(value);
          },
        },
        Hp_mSv_Julio: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Julio'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatDosisHistorico(value);
          },
        },
        Hp_mSv_Agosto: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Agosto'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatDosisHistorico(value);
          },
        },
        Hp_mSv_Septiembre: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Septiembre'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatDosisHistorico(value);
          },
        },
        Hp_mSv_Octubre: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Octubre'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatDosisHistorico(value);
          },
        },
        Hp_mSv_Noviembre: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Noviembre'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatDosisHistorico(value);
          },
        },
        Hp_mSv_Diciembre: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Diciembre'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatDosisHistorico(value);
          },
        },
        Total_mSv: {
          title: this.translate.instant('GLOBAL.dosimetria.total_mSv'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatDosisTotal(value);
          },
        },
        Hp_acumulado: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_acumulado'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return formatDosisTotal(value);
          },
        },
      },
    };
  }

  compareById(o1,o2){
    if(o1 == null || o2 == null){
      return false;
    }
    return o1.Id === o2.Id;
  }


  loadOptionsPeriodo(): void {
    let periodo: Array<any> = [];
    // Histórico: solo periodos ≤2023 (datos recientes van al módulo Dosimetría / HU-15)
    this.registroService.get('periododosi?maxPeriodo=2023')
      .subscribe(res => {
        if (res !== null) {
          this.Periodo = <Array<Periodo>>res;
        }
      });
  }      

  // FUNCIONES PARA EL SELECT MULTIPLE DE PERIODO - INICIO
  toggleSelectAll(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    const periodoControl = this.filtrarForm.get('Periodo');
    const currentValue = periodoControl.value || [];
    
    if (currentValue.length >= this.Periodo.length) {
      // Si todos están seleccionados, deseleccionar todos
      periodoControl.setValue([]);
    } else {
      // Si no todos están seleccionados, seleccionar todos
      periodoControl.setValue([...this.Periodo]);
    }
  }

  /** Preview de años seleccionados en el trigger (hallazgo 22-sep). */
  get periodoTriggerLabel(): string {
    const selected = this.filtrarForm && this.filtrarForm.value
      ? this.filtrarForm.value.Periodo
      : null;
    if (!Array.isArray(selected) || !selected.length) {
      return 'Seleccione';
    }
    if (this.Periodo.length > 0 && selected.length >= this.Periodo.length) {
      return 'Todos seleccionados';
    }
    const years = selected
      .map((p) => (p && (p.Periodo != null ? p.Periodo : p.Id)))
      .filter((y) => y != null && y !== '')
      .map((y) => String(y));
    if (!years.length) {
      return 'Seleccione';
    }
    if (years.length <= 4) {
      return years.join(', ');
    }
    return years.slice(0, 3).join(', ') + '… (+' + (years.length - 3) + ')';
  }
  // FUNCIONES PARA EL SELECT MULTIPLE DE PERIODO - FIN

  // FUNCIONES PARA EL CHECKBOX DEL HEADER DE LA TABLA - INICIO
async toggleAllRows(): Promise<void> {
  const rows = await this.source.getAll();
  const getId = (r: any) => r.Id || r.id || r.local_id || r.ID;
  
  // Contar cuántas filas están seleccionadas
  const selectedCount = rows.filter(r => r.Selected).length;
  
  // Si todas están seleccionadas, deseleccionar todas; sino, seleccionar todas
  const newState = selectedCount < rows.length;
  
  rows.forEach(row => {
    row.Selected = newState;
    if (newState) {
      row.SelectedId = getId(row);
    } else {
      row.SelectedId = null;
    }
    this.seleccion.syncFromRow(row);
  });
  
  await this.source.load(rows);
}
async getSelectedCount(): Promise<number> {
  const rows = await this.source.getAll();
  return rows.filter(r => r.Selected).length;
}
  async updateHeaderCheckboxState(): Promise<void> {
  // Esperar un tick para que el DOM se actualice
      setTimeout(async () => {
        const rows = await this.source.getAll();
        const selectedCount = rows.filter(r => r.Selected).length;
        const totalCount = rows.length;
        
        const headerCheckbox = document.querySelector('.ng2-smart-th-Seleccionar input[type="checkbox"]') as HTMLInputElement;
        
        if (headerCheckbox) {
          headerCheckbox.checked = totalCount > 0 && selectedCount === totalCount;
          headerCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalCount;
        }
      }, 100);
    }

  private injectHeaderCheckbox(): void {
    const headerCell = document.querySelector('.ng2-smart-th-Seleccionar');
    if (headerCell) {
      // Limpiar contenido existente del header
      const titleElement = headerCell.querySelector('.ng2-smart-title');
      if (titleElement) {
        titleElement.innerHTML = '';
        // Crear el checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.cursor = 'pointer';
        checkbox.style.transform = 'scale(1.2)';
        // Agregar el evento
        checkbox.addEventListener('change', () => {
          this.toggleAllRows();
        });
        titleElement.appendChild(checkbox);
      }
    }
  }

  itemselec(event: any): void {
    this.updateHeaderCheckboxState();
  }
  // FUNCIONES PARA EL CHECKBOX DEL HEADER DE LA TABLA - FIN

  /** Reinicia filtros, cédula anclada, selección y tabla (nuevo caso / peticionario). */
  Limpiar(): void {
    this.seleccion.resetCase();
    this.submitted = false;
    const limpiar: any = {
      Departamento: null,
      Municipio: null,
      Ciclo: null,
      Periodo: [],
      Identificacion_empleado: '',
      Nombre_empleado: '',
      Apellido_empleado: '',
    };
    if (this.user_operador === 0) {
      limpiar.Operador = null;
    }
    const idCtrl = this.filtrarForm.get('Identificacion_empleado');
    if (idCtrl) {
      idCtrl.enable({ emitEvent: false });
    }
    this.filtrarForm.patchValue(limpiar);
    this.setNombreApellidoEnabled(false);
    Object.keys(this.filtrarForm.controls).forEach((key) => {
      const control = this.filtrarForm.get(key);
      if (!control) { return; }
      control.markAsPristine();
      control.markAsUntouched();
      control.setErrors(null);
      control.updateValueAndValidity({ emitEvent: false });
    });
    this.source.load([]);
  }

  /** HU-4: nombre/apellido solo tras consulta exitosa por cédula. */
  private setNombreApellidoEnabled(enabled: boolean): void {
    const nom = this.filtrarForm.get('Nombre_empleado');
    const ape = this.filtrarForm.get('Apellido_empleado');
    if (enabled) {
      if (nom) { nom.enable({ emitEvent: false }); }
      if (ape) { ape.enable({ emitEvent: false }); }
    } else {
      if (nom) { nom.disable({ emitEvent: false }); }
      if (ape) { ape.disable({ emitEvent: false }); }
    }
  }

  async downloadData(): Promise<void> {
    const selectedIds = this.seleccion.selectedIds;
    if (!selectedIds.length) {
      this.toasterService.pop('warning', 'Advertencia', 'Debe seleccionar al menos un registro');
      return;
    }
    const filtros = { local_ids: selectedIds };

    this.registroService
      .post('reportehistoricodosimetria', filtros)
      .subscribe(
        (resp: { filename: string; mime: string; base64: string }) => {
          this.descargarBase64ComoArchivo(resp.base64, resp.mime, resp.filename || 'REPORTE_HISTORICO_DOSIMETRIA.xlsx');
        },
        (err) => {
          this.filtrarForm.get('Identificacion_empleado').enable({ emitEvent: false });
        }
      );
  }



async downloadWordData(): Promise<void> {
  const selectedIds = this.seleccion.selectedIds;

  if (selectedIds.length === 0) {
    this.toasterService.pop('warning', 'Advertencia', 'Debe seleccionar al menos un registro');
    return;
  }

  const filtros = {
    local_ids: selectedIds
  };

  // Llamar al endpoint /doc (diferente al de Excel)
  this.registroService
    .post('reportehistoricodosimetria/doc', filtros)
    .subscribe(
      (resp: { filename: string; mime: string; base64: string }) => {
          this.descargarBase64ComoArchivo(resp.base64, resp.mime, resp.filename || 'REPORTE_HISTORIAL_DOSIMETRIA.docx');
      },
      (err) => {
        console.error('Error descargando Word:', err);
        this.toasterService.pop('error', 'Error', 'No se pudo generar el documento Word');
        this.filtrarForm.get('Identificacion_empleado').enable({ emitEvent: false });
      }
    );
}

private descargarWordComoArchivo(data: ArrayBuffer | Blob, nombre = 'reporte_dosimetrico.docx'): void {
  let blob: Blob;

  if (data instanceof Blob) {
    blob = data;
  } else {
    blob = new Blob([data], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
  }

  // Crear URL y descargar
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  // Mostrar mensaje de éxito
  this.toasterService.pop('success', 'Éxito', 'Documento Word descargado correctamente');
}



  private descargarBase64ComoArchivo(base64: string, mime = 'application/octet-stream', nombre = 'archivo.xlsx') {
    const blob = this.base64ToBlob(base64, mime);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private base64ToBlob(b64Data: string, contentType = 'application/octet-stream', sliceSize = 512): Blob {
    const byteCharacters = atob(b64Data);
    const byteArrays: Uint8Array[] = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: contentType });
  }

  submitted = false;

  loadData(): void {
    this.submitted = true;

    const idCtrlPre = this.filtrarForm.get('Identificacion_empleado');
    if (idCtrlPre && idCtrlPre.disabled) {
      idCtrlPre.enable({ emitEvent: false });
    }

    const filtros = this.filtrarForm.getRawValue();
    Object.keys(this.filtrarForm.controls).forEach(key => {
      const control = this.filtrarForm.get(key);
      control.markAsTouched();
      control.markAsDirty();
      control.updateValueAndValidity({ onlySelf: true });
    });
    const control = this.filtrarForm.get('Identificacion_empleado');
    const idValue = control && control.value != null ? String(control.value).trim() : '';
    if (!idValue || control.invalid) {
      const errs = control.errors || {};
      if (!idValue) {
        errs.required = true;
      }
      control.setErrors(errs);       
      control.markAsTouched();
      control.markAsDirty();
      control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      return;
    }

    let periodo = '';
    if (Array.isArray(filtros.Periodo) && filtros.Periodo.length) {
      periodo = filtros.Periodo
        .map(p => p ? p.Id : null)
        .filter(id => id != null)
        .join(',');
    } else if (filtros.Periodo ? filtros.Periodo.Id : null != null) {
      // (por si en algún flujo aún cae un solo objeto)
      periodo = filtros.Periodo.Id;
    }
    this.seleccion.setAnchor(idValue);
    const get_url = buildHistoricSearchUrl(
      idValue,
      periodo,
      filtros.Nombre_empleado,
      filtros.Apellido_empleado,
    );

    this.registroService
    .get(get_url)
    .subscribe(async (res) => {
      if (res === null) {
        this.filtrarForm.get('Identificacion_empleado').enable({ emitEvent: false });
        return;
      }

      this.filtrarForm.get('Identificacion_empleado').disable({ emitEvent: false });
      // Nombre/apellido ya habilitados al ingresar documento (HU-10 §2.2); se mantienen.
      const data = res as Array<any>;
      for (let i = 0; i < data.length; i++) {
        mapHistoricApiRowToTable(data[i]);
      }

      const merged = this.seleccion.mergeResultRows(data);
      merged.sort(sortHistoricTableRows);
      this.injectHeaderCheckbox();
      this.source.load(merged);
      this.source.setSort([{ field: 'Periodo', direction: 'desc' }], false);
      
      // Actualizar el estado del checkbox del header después de cargar datos
      this.updateHeaderCheckboxState();

      this.excel = [];
      merged.forEach((row) => {
        this.excel.push({
            Operador_Enegia: row.Nombreoperador,
            Periodo_Reporte: row.Periodo,
            Nit_Entidad: formatNoReporta(row.Identificacionentidad),
            Nombre_Entidad: formatNoReporta(row.Nombreentidad),
            //Municipio_Entidad: row.NombreMunicipio,
            //Codigo_Departamento: row.Codigo_Departamento,
            Direccion_Entidad: formatNoReporta(row.Direccionentidad),
            Correo_Entidad: formatNoReporta(row.Correoentidad),
            Documento_Trabajador: formatNoReporta(row.Identificacionempleado),
            Nombres_Trabajador: formatNoReporta(row.Nombreempleado),
            Apellidos_Trabajador: formatNoReporta(row.Apellidoempleado),
            Fecha_nacimiento_Trabajador: formatFechaDashboard(row.Fecha_nacimiento, moment),
            Genero_Trabajador: formatNoReporta(row.Genero_empleado),
            Nivel_educacion_Trabajador: formatNoReporta(row.Nivel_educacion),
            Titulo_Trabajador: formatNoReporta(row.Titulo),
            Fecha_inicio_exposicion_Trabajador: formatFechaDashboard(row.Fecha_inicio_exposicion_empleado, moment),
            Fecha_fin_exposicion_Trabajador: formatFechaDashboard(row.Fecha_fin_exposicion_empleado, moment),
            Frecuencia_medicion: formatNoReporta(row.Frecuencia_medicion),
            Modifica_frecuencia_medicion: formatNoReporta(row.Frecuencia_cambio),
            Practica_RI: formatNoReporta(row.Practica_ri),
            Tipo_dosimetro: formatNoReporta(row.Tipo_dosimetro),
            Tecnologia_dosimetro: formatNoReporta(row.Tecnologia_dosimetro),
            Hp_mSv_Enero: formatDosisHistorico(row.Hp_mSv_Enero),
            Hp_mSv_Febrero: formatDosisHistorico(row.Hp_mSv_Febrero),
            Hp_mSv_Marzo: formatDosisHistorico(row.Hp_mSv_Marzo),
            Hp_mSv_Abril: formatDosisHistorico(row.Hp_mSv_Abril),
            Hp_mSv_Mayo: formatDosisHistorico(row.Hp_mSv_Mayo),
            Hp_mSv_Junio: formatDosisHistorico(row.Hp_mSv_Junio),
            Hp_mSv_Julio: formatDosisHistorico(row.Hp_mSv_Julio),
            Hp_mSv_Agosto: formatDosisHistorico(row.Hp_mSv_Agosto),
            Hp_mSv_Septiembre: formatDosisHistorico(row.Hp_mSv_Septiembre),
            Hp_mSv_Octubre: formatDosisHistorico(row.Hp_mSv_Octubre),
            Hp_mSv_Noviembre: formatDosisHistorico(row.Hp_mSv_Noviembre),
            Hp_mSv_Diciembre: formatDosisHistorico(row.Hp_mSv_Diciembre),
            Hp_Acumulado: formatDosisTotal(row.Hp_acumulado),
            Observaciones_dosis_de_notificacion: row.Intervencion_Observacion,
            Observaciones_generales: row.Investigacion_Observacion
          }
          );
        });
      },
      (err) => {
        console.error('Error consulta histórico:', err);
        const msg = (err && err.error && err.error.error)
          || (err && err.message)
          || 'No se pudo completar la consulta (cédula + nombre/apellido)';
        this.toasterService.pop('error', 'Error', msg);
      }
    );
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.docEscalonSub) {
      this.docEscalonSub.unsubscribe();
    }
  }

  ngAfterViewInit() {
    // Inyectar el checkbox en el header de la tabla después de que se renderice
    /*setTimeout(() => {
      this.injectHeaderCheckbox();
    }, 10000);*/
  }

  registros: DosimetriaView[] = [];
 

  onCreate(event) {
    const modal = this.modalService.open(DosimetriaFormComponent,{windowClass:"my-class"});
    modal.result.then((data) => {
      this.loadData(); // on close
    }, (reason) => {
    });
  }
}