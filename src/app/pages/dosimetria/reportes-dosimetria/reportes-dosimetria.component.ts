import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalDataSource } from 'ng2-smart-table';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { Subscription } from 'rxjs';
import { DosimetriaService } from '../../../@core/data/services/dosimetria.service';
import { ExcelServicesService } from '../../../@core/data/excel-services.service';
import { Operador } from '../../../@core/data/models/operador/operador';
import { CheckboxRenderComponent } from '../dosimetria-historic/checkbox-render.component';
import { DosimetriaDetalleModalComponent } from '../dosimetria-detalle-modal/dosimetria-detalle-modal.component';

@Component({
  selector: 'app-reportes-dosimetria',
  templateUrl: './reportes-dosimetria.component.html',
  styleUrls: ['./reportes-dosimetria.component.scss'],
})
export class ReportesDosimetriaComponent implements OnInit, OnDestroy {
  config: ToasterConfig;
  filtrarForm: FormGroup;
  pagerForm: FormGroup;
  source: LocalDataSource = new LocalDataSource();
  settings: any;

  Operadores: Operador[] = [];
  OperadoresFiltrados: Operador[] = [];
  Anios: Array<{ Id: number; Periodo: string }> = [];
  operadorSearch = '';

  loading = false;
  hasSearched = false;
  workerSearchMode = false;
  currentPage = 1;
  pageSize = 20;
  totalRows = 0;
  totalPages = 0;

  private dataSub: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private registroService: DosimetriaService,
    private excelService: ExcelServicesService,
    private toasterService: ToasterService,
    private modalService: NgbModal,
  ) {
    this.buildForms();
    this.buildTableSettings(false);
    this.buildAnios();
    this.loadOperadores();
  }

  ngOnInit(): void {
    this.config = new ToasterConfig({ timeout: 5000 });
  }

  ngOnDestroy(): void {
    if (this.dataSub) this.dataSub.unsubscribe();
  }

  private buildForms(): void {
    this.filtrarForm = this.formBuilder.group({
      Operadores: [[]],
      Periodos: [[]],
      Identificacion_empleado: ['', Validators.compose([
        Validators.minLength(4),
        Validators.maxLength(15),
        Validators.pattern('^[A-Za-z0-9-]+$'),
      ])],
      Nombre_empleado: ['', Validators.compose([
        Validators.minLength(3),
        Validators.pattern('^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$'),
      ])],
      Apellido_empleado: ['', Validators.compose([
        Validators.minLength(3),
        Validators.pattern('^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$'),
      ])],
    });

    this.pagerForm = this.formBuilder.group({
      Rowspage: [20],
    });
  }

  private buildAnios(): void {
    const current = new Date().getFullYear();
    const list = [];
    for (let y = current; y >= 1999; y--) {
      list.push({ Id: y, Periodo: String(y) });
    }
    this.Anios = list;
  }

  private buildTableSettings(workerMode: boolean): void {
    const cols: any = {};
    if (workerMode) {
      cols.Seleccionar = {
        title: '✔',
        type: 'custom',
        renderComponent: CheckboxRenderComponent,
        filter: false,
        editable: false,
        addable: false,
      };
    }
    cols.EmpresaDosimetria = {
      title: 'Empresa de Dosimetría Personal',
      valuePrepareFunction: (v, row) => row.NombreOperador || row.Operador || row.Nombreoperador || v,
    };
    cols.Periodo = { title: 'Periodo de Reporte (Año)' };
    cols.Entidad = {
      title: 'Entidad Contratante',
      valuePrepareFunction: (v, row) => row.Nombreentidad || row.Nombre_Entidad || v,
    };
    cols.Identificacion = {
      title: 'Identificación del Trabajador',
      valuePrepareFunction: (v, row) => row.Identificacionempleado || row.Documento_TOE || v,
    };
    cols.Nombre = {
      title: 'Nombre del Trabajador',
      valuePrepareFunction: (v, row) => row.Nombreempleado || row.Nombres_TOE || v,
    };
    cols.Apellido = {
      title: 'Apellido del Trabajador',
      valuePrepareFunction: (v, row) => row.Apellidoempleado || row.Apellidos_TOE || v,
    };

    this.settings = {
      actions: false,
      mode: 'external',
      pager: { display: false },
      rowClassFunction: () => 'hu10-row-clickable',
      columns: cols,
    };
  }

  loadOperadores(): void {
    this.registroService.get('operador_light').subscribe((res) => {
      if (res != null) {
        this.Operadores = res as Operador[];
        this.OperadoresFiltrados = [...this.Operadores];
      }
    });
  }

  filterOperadores(): void {
    const q = (this.operadorSearch || '').trim().toLowerCase();
    if (!q) {
      this.OperadoresFiltrados = [...this.Operadores];
      return;
    }
    this.OperadoresFiltrados = this.Operadores.filter((o) =>
      String(o.Nombres || '').toLowerCase().includes(q)
      || String(o.Id || '').includes(q),
    );
  }

  isOperadorSelected(op: Operador): boolean {
    const selected: Operador[] = this.filtrarForm.get('Operadores').value || [];
    return selected.some((s) => s && s.Id === op.Id);
  }

  toggleOperador(op: Operador, event?: Event): void {
    if (event) event.preventDefault();
    const ctrl = this.filtrarForm.get('Operadores');
    let selected: Operador[] = [...(ctrl.value || [])];
    const idx = selected.findIndex((s) => s && s.Id === op.Id);
    if (idx >= 0) {
      selected.splice(idx, 1);
    } else {
      selected.push(op);
    }
    ctrl.setValue(selected);
  }

  removeOperador(op: Operador): void {
    const ctrl = this.filtrarForm.get('Operadores');
    const selected = (ctrl.value || []).filter((s: Operador) => s.Id !== op.Id);
    ctrl.setValue(selected);
  }

  toggleAllAnios(): void {
    const ctrl = this.filtrarForm.get('Periodos');
    const current = ctrl.value || [];
    if (current.length >= this.Anios.length) {
      ctrl.setValue([]);
    } else {
      ctrl.setValue([...this.Anios]);
    }
  }

  isAnioSelected(anio: { Id: number; Periodo: string }): boolean {
    const selected: Array<{ Id: number; Periodo: string }> = this.filtrarForm.get('Periodos').value || [];
    return selected.some((s) => s && s.Id === anio.Id);
  }

  toggleAnio(anio: { Id: number; Periodo: string }, event?: Event): void {
    if (event) event.preventDefault();
    const ctrl = this.filtrarForm.get('Periodos');
    let selected: Array<{ Id: number; Periodo: string }> = [...(ctrl.value || [])];
    const idx = selected.findIndex((s) => s && s.Id === anio.Id);
    if (idx >= 0) {
      selected.splice(idx, 1);
    } else {
      selected.push(anio);
    }
    ctrl.setValue(selected);
  }

  removeAnio(anio: { Id: number; Periodo: string }): void {
    const ctrl = this.filtrarForm.get('Periodos');
    const selected = (ctrl.value || []).filter((s: { Id: number }) => s.Id !== anio.Id);
    ctrl.setValue(selected);
  }

  get selectedOperadores(): Operador[] {
    return this.filtrarForm.get('Operadores').value || [];
  }

  get selectedPeriodos(): Array<{ Id: number; Periodo: string }> {
    return this.filtrarForm.get('Periodos').value || [];
  }

  /** Años seleccionados como lista CSV para la API (ej. "2024,2023"). */
  private getSelectedPeriodoParam(): string {
    return this.selectedPeriodos
      .map((p) => String(p.Periodo || p.Id))
      .filter((v) => v && v !== '0')
      .join(',');
  }

  onDocumentoChange(): void {
    const doc = (this.filtrarForm.get('Identificacion_empleado').value || '').trim();
    if (doc) {
      this.filtrarForm.get('Nombre_empleado').enable({ emitEvent: false });
      this.filtrarForm.get('Apellido_empleado').enable({ emitEvent: false });
    }
  }

  consultar(): void {
    const doc = (this.filtrarForm.get('Identificacion_empleado').value || '').trim();
    this.workerSearchMode = !!doc;
    this.buildTableSettings(this.workerSearchMode);
    this.currentPage = 1;
    this.hasSearched = true;
    this.loadData();
  }

  private loadData(): void {
    if (this.workerSearchMode) {
      this.loadWorkerData();
    } else {
      this.loadGeneralData();
    }
  }

  private goToPage(page: number): void {
    const target = Math.min(Math.max(page, 1), this.totalPagesDisplay);
    if (target === this.currentPage && this.totalRows > 0) {
      return;
    }
    this.currentPage = target;
    this.loadData();
  }

  private loadGeneralData(): void {
    if (this.dataSub) this.dataSub.unsubscribe();

    const operadores = this.selectedOperadores.map((o) => o.Id).join(',');
    const periodos = this.getSelectedPeriodoParam();

    const queryParams: { [key: string]: string | number } = {
      page: this.currentPage,
      pageSize: this.pageSize,
    };
    if (operadores) queryParams.operadorIds = operadores;
    if (periodos) queryParams.periodos = periodos;

    this.loading = true;
    const endpoint = 'reportedosimetria/0/0/0/0/0/0/0';
    this.dataSub = this.registroService.getWithParams(endpoint, queryParams).subscribe(
      (res) => this.handleGeneralResponse(res),
      () => this.handleLoadError(),
    );
  }

  private handleGeneralResponse(res: any): void {
    this.loading = false;
    if (res == null) {
      this.source.load([]);
      this.totalRows = 0;
      return;
    }
    const payload = res;
    const data = Array.isArray(payload) ? payload : (payload.data || []);
    this.totalRows = Array.isArray(payload) ? data.length : (payload.total || 0);
    this.currentPage = Array.isArray(payload) ? 1 : (payload.page || this.currentPage);
    this.pageSize = Array.isArray(payload) ? data.length : (payload.pageSize || this.pageSize);
    this.totalPages = this.pageSize > 0 ? Math.ceil(this.totalRows / this.pageSize) : 0;

    const normalized = data.map((row) => this.normalizeGeneralRow(row, this.workerSearchMode));
    this.source.load(normalized);
    this.source.setPaging(1, this.pageSize, true);
  }

  private normalizeGeneralRow(row: any, workerMode = false): any {
    const rep = row.Reportedosimetria || {
      Hp_mSv_Enero: row.hp_msv_enero_str || row.hp_msv_enero,
      Hp_mSv_Febrero: row.hp_msv_febrero_str || row.hp_msv_febrero,
      Hp_mSv_Marzo: row.hp_msv_marzo_str || row.hp_msv_marzo,
      Hp_mSv_Abril: row.hp_msv_abril_str || row.hp_msv_abril,
      Hp_mSv_Mayo: row.hp_msv_mayo_str || row.hp_msv_mayo,
      Hp_mSv_Junio: row.hp_msv_junio_str || row.hp_msv_junio,
      Hp_mSv_Julio: row.hp_msv_julio_str || row.hp_msv_julio,
      Hp_mSv_Agosto: row.hp_msv_agosto_str || row.hp_msv_agosto,
      Hp_mSv_Septiembre: row.hp_msv_septiembre_str || row.hp_msv_septiembre,
      Hp_mSv_Octubre: row.hp_msv_octubre_str || row.hp_msv_octubre,
      Hp_mSv_Noviembre: row.hp_msv_noviembre_str || row.hp_msv_noviembre,
      Hp_mSv_Diciembre: row.hp_msv_diciembre_str || row.hp_msv_diciembre,
      Tipo_dosimetro: { Nombre: row.TipoDosimetro || row.Tipo_dosimetro },
      Total_mSv: row.total_mSv,
      Hp_acumulado: row.hp_acumulado,
    };
    return {
      ...row,
      Selected: workerMode ? false : row.Selected,
      SelectedId: workerMode ? row.Id : row.SelectedId,
      NombreOperador: row.NombreOperador || row.Nombreoperador || row.Operador,
      Nombreentidad: row.Nombreentidad || row.Nombre_Entidad,
      Identificacionempleado: row.Identificacionempleado || row.Documento_TOE,
      Nombreempleado: row.Nombreempleado || row.Nombres_TOE,
      Apellidoempleado: row.Apellidoempleado || row.Apellidos_TOE,
      Tipo_dosimetro: row.TipoDosimetro || row.Tipo_dosimetro,
      Reportedosimetria: rep,
      Total_mSv: row.total_mSv != null ? row.total_mSv : rep.Total_mSv,
      Hp_acumulado: row.hp_acumulado || row.Hp_Acumulado,
    };
  }

  private loadWorkerData(): void {
    if (this.dataSub) this.dataSub.unsubscribe();

    const f = this.filtrarForm.value;
    const doc = (f.Identificacion_empleado || '').trim();
    const operadores = this.selectedOperadores.map((o) => o.Id).join(',');
    const periodos = this.getSelectedPeriodoParam();

    const queryParams: { [key: string]: string | number } = {
      page: this.currentPage,
      pageSize: this.pageSize,
    };
    if (operadores) queryParams.operadorIds = operadores;
    if (periodos) queryParams.periodos = periodos;

    const endpoint = 'reportedosimetria/0/0/0/0/' + encodeURIComponent(doc) + '/0/0';
    this.loading = true;
    this.dataSub = this.registroService.getWithParams(endpoint, queryParams).subscribe(
      (res) => this.handleGeneralResponse(res),
      () => this.handleLoadError(),
    );
  }

  private handleLoadError(): void {
    this.loading = false;
    this.source.load([]);
    this.toasterService.pop('error', 'Consulta', 'No fue posible obtener los resultados.');
  }

  limpiar(): void {
    this.filtrarForm.reset({
      Operadores: [],
      Periodos: [],
      Identificacion_empleado: '',
      Nombre_empleado: '',
      Apellido_empleado: '',
    });
    this.operadorSearch = '';
    this.OperadoresFiltrados = [...this.Operadores];
    this.hasSearched = false;
    this.workerSearchMode = false;
    this.source.load([]);
    this.totalRows = 0;
    this.buildTableSettings(false);
  }

  paginas(): void {
    this.pageSize = Number(this.pagerForm.get('Rowspage').value) || 20;
    this.currentPage = 1;
    if (this.hasSearched) {
      this.loadData();
    } else if (this.workerSearchMode) {
      this.source.setPaging(1, this.pageSize, true);
    }
  }

  get totalPagesDisplay(): number {
    return this.totalPages > 0 ? this.totalPages : 1;
  }

  firstPage(): void { this.goToPage(1); }
  prevPage(): void { this.goToPage(this.currentPage - 1); }
  nextPage(): void { this.goToPage(this.currentPage + 1); }
  lastPage(): void { this.goToPage(this.totalPagesDisplay); }

  goToPageFromInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const p = parseInt(input.value, 10);
    if (!Number.isNaN(p)) {
      this.goToPage(p);
    }
  }

  exportResumen(): void {
    if (!this.hasSearched) return;

    if (this.workerSearchMode) {
      this.exportWorkerResumen();
      return;
    }

    const operadores = this.selectedOperadores.map((o) => o.Id).join(',');
    const periodos = this.getSelectedPeriodoParam();
    const queryParams: { [key: string]: string | number } = {
      page: 1,
      pageSize: 50000,
      export: 1,
    };
    if (operadores) queryParams.operadorIds = operadores;
    if (periodos) queryParams.periodos = periodos;

    this.loading = true;
    this.registroService.getWithParams('reportedosimetria/0/0/0/0/0/0/0', queryParams).subscribe(
      (res) => {
        this.loading = false;
        const payload = res as any;
        const data = Array.isArray(payload) ? payload : (payload.data || []);
        if (!data.length) {
          this.toasterService.pop('warning', 'Exportación', 'No hay datos para exportar.');
          return;
        }
        const rows = data.map((row) => this.mapExportRow(this.normalizeGeneralRow(row)));
        this.excelService.exportAsExcelFileConUmbrales(rows, 'Reportes_Dosimetria');
      },
      () => {
        this.loading = false;
        this.toasterService.pop('error', 'Exportación', 'No se pudo generar el resumen.');
      },
    );
  }

  private exportWorkerResumen(): void {
    this.source.getAll().then((rows) => {
      if (!rows.length) {
        this.toasterService.pop('warning', 'Exportación', 'No hay datos para exportar.');
        return;
      }
      const excelRows = rows.map((row) => this.mapExportRow(row));
      this.excelService.exportAsExcelFileConUmbrales(excelRows, 'Reportes_Dosimetria_Trabajador');
    });
  }

  /** HU-10 §3.2.1 / §3.2.1.1: 36 columnas del formato + umbrales T / V–AG / AH. */
  private mapExportRow(row: any): any {
    const rep = row.Reportedosimetria || {};
    return {
      Nit_Entidad: row.Identificacionentidad || row.Nit_Entidad,
      Nombre_Entidad: row.Nombreentidad || row.Nombre_Entidad,
      Municipio_Entidad: (row.Municipio && row.Municipio.NombreMunicipio) || row.Municipio_Entidad || 'NR',
      Codigo_Municipio: (row.Municipio && row.Municipio.Codigo) || row.Codigo_Municipio || 'NR',
      Codigo_Departamento: (row.Departamento && row.Departamento.Codigo) || row.Codigo_Departamento || 'NR',
      Direccion_Entidad: row.Direccionentidad || row.Direccion_Entidad || '',
      Correo_Entidad: row.Correoentidad || row.Correo_Entidad || '',
      Documento_Trabajador: row.Identificacionempleado || row.Documento_TOE,
      Nombres_Trabajador: row.Nombreempleado || row.Nombres_TOE,
      Apellidos_Trabajador: row.Apellidoempleado || row.Apellidos_TOE,
      Fecha_nacimiento_Trabajador: row.Fecha_nacimiento || row.fecha_nacimiento || '',
      Genero_Trabajador: row.Genero_empleado || row.Genero || '',
      Nivel_educacion_Trabajador: row.Nivel_educacion || '',
      Titulo_Trabajador: row.Titulo || '',
      Fecha_inicio_exposicion_Trabajador: row.Fecha_inicio_exposicion_empleado || row.fecha_inicio_exposicion || '',
      Fecha_fin_exposicion_Trabajador: row.Fecha_fin_exposicion_empleado || row.fecha_fin_exposicion || '',
      Frecuencia_medicion: row.Frecuencia_medicion || row.FrecuenciaMedicion || '',
      Modifica_frecuencia_medicion: row.Frecuencia_cambio || '',
      Practica_RI: row.Practica_ri || row.PracticaRI || '',
      Tipo_dosimetro: row.TipoDosimetro || row.Tipo_dosimetro || '', // Columna T
      Tecnologia_dosimetro: row.Tecnologia_dosimetro || row.TecnologiaDosimetro || '',
      Hp_mSv_Enero: rep.Hp_mSv_Enero != null ? rep.Hp_mSv_Enero : row.Hp_mSv_Enero,
      Hp_mSv_Febrero: rep.Hp_mSv_Febrero != null ? rep.Hp_mSv_Febrero : row.Hp_mSv_Febrero,
      Hp_mSv_Marzo: rep.Hp_mSv_Marzo != null ? rep.Hp_mSv_Marzo : row.Hp_mSv_Marzo,
      Hp_mSv_Abril: rep.Hp_mSv_Abril != null ? rep.Hp_mSv_Abril : row.Hp_mSv_Abril,
      Hp_mSv_Mayo: rep.Hp_mSv_Mayo != null ? rep.Hp_mSv_Mayo : row.Hp_mSv_Mayo,
      Hp_mSv_Junio: rep.Hp_mSv_Junio != null ? rep.Hp_mSv_Junio : row.Hp_mSv_Junio,
      Hp_mSv_Julio: rep.Hp_mSv_Julio != null ? rep.Hp_mSv_Julio : row.Hp_mSv_Julio,
      Hp_mSv_Agosto: rep.Hp_mSv_Agosto != null ? rep.Hp_mSv_Agosto : row.Hp_mSv_Agosto,
      Hp_mSv_Septiembre: rep.Hp_mSv_Septiembre != null ? rep.Hp_mSv_Septiembre : row.Hp_mSv_Septiembre,
      Hp_mSv_Octubre: rep.Hp_mSv_Octubre != null ? rep.Hp_mSv_Octubre : row.Hp_mSv_Octubre,
      Hp_mSv_Noviembre: rep.Hp_mSv_Noviembre != null ? rep.Hp_mSv_Noviembre : row.Hp_mSv_Noviembre,
      Hp_mSv_Diciembre: rep.Hp_mSv_Diciembre != null ? rep.Hp_mSv_Diciembre : row.Hp_mSv_Diciembre,
      Hp_Acumulado: row.Hp_acumulado != null ? row.Hp_acumulado : (row.Hp_Acumulado != null ? row.Hp_Acumulado : rep.Hp_acumulado),
      Observaciones_dosis_notificacion: row.Observaciones_dosis || '',
      Observaciones_generales: row.Observaciones || '',
    };
  }

  async downloadHistorial(): Promise<void> {
    if (!this.workerSearchMode || !this.hasSearched) return;
    const rows = await this.source.getAll();
    const local_ids = rows.filter((r) => r.Selected).map((r) => r.SelectedId).filter(Boolean);
    if (!local_ids.length) {
      this.toasterService.pop('warning', 'Historial', 'Seleccione al menos un registro.');
      return;
    }
    this.registroService.post('reportehistoricodosimetria', { local_ids }).subscribe(
      (resp: { filename: string; mime: string; base64: string }) => {
        this.descargarBase64(resp.base64, resp.mime, resp.filename || 'HISTORIAL_DOSIMETRICO.xlsx');
      },
      () => this.toasterService.pop('error', 'Historial', 'No se pudo generar el historial dosimétrico.'),
    );
  }

  private descargarBase64(base64: string, mime: string, filename: string): void {
    const byteChars = atob(base64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: mime });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  onRowSelect(event: any): void {
    if (!event || !event.data) return;
    const skipAt = event.data.__hu10SkipModalAt;
    if (skipAt && (Date.now() - Number(skipAt)) < 400) {
      delete event.data.__hu10SkipModalAt;
      return;
    }
    const modal = this.modalService.open(DosimetriaDetalleModalComponent, { size: 'lg', windowClass: 'hu10-modal' });
    modal.componentInstance.registro = event.data;
  }
}
