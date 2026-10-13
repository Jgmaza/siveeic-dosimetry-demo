import { Component, OnDestroy, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import 'style-loader!angular2-toaster/toaster.css';
import { Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap, catchError } from 'rxjs/operators';

import { DosimetriaService } from '../../../@core/data/services/dosimetria.service';
import { ExcelServicesService } from '../../../@core/data/excel-services.service';
import { Operador } from '../../../@core/data/models/operador/operador';
import { Periodo } from '../../../@core/data/models/general/periodo';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { CheckboxRenderComponent } from '../dosimetria-historic/checkbox-render.component';
import { DosimetriaHistoricoSeleccionService } from '../dosimetria-historico-seleccion.service';
import { DosimetriaDetalleModalComponent } from '../dosimetria-detalle-modal/dosimetria-detalle-modal.component';
import { sortHistoricTableRows } from '../dosimetria-historic-rows';

@Component({
  selector: 'app-dosimetria-unificado',
  templateUrl: './dosimetria-unificado.component.html',
  styleUrls: ['./dosimetria-unificado.component.scss'],
})
export class DosimetriaUnificadoComponent implements OnInit, OnDestroy {
  user_operador: number;
  uid: number;
  config: ToasterConfig;
  settings: any;
  excel = [];
  source: LocalDataSource = new LocalDataSource();
  isAdmin = false;
  loading = false;
  currentPage = 1;
  pageSize = 200;
  totalRows = 0;
  totalPages = 0;
  q = '';
  /** HU-10 §1: la grilla solo se muestra después de Consultar. */
  hasSearched = false;
  /** Consulta por trabajador anclado (comunicado HU-6); tabla con checkboxes. */
  workerComunicadoMode = false;
  workerSubmitted = false;
  /** Búsqueda libre sobre resultados (Q): oculta en UI; poner true para reactivar. */
  showResultSearch = false;
  private searchSub: Subscription;
  private dataSub: Subscription;
  private userSub: Subscription;

  filtrarForm: FormGroup;
  registroForm: FormGroup;
  operadorSearchCtrl = new FormControl('');
  filteredOperadores: Operador[] = [];
  Operador = [];
  Periodo = [];
  utilidadesService: UtilidadesService = new UtilidadesService();
  private operadorFilterSub: Subscription;
  private docEscalonSub: Subscription;

  get anchoredCedula(): string | null {
    return this.seleccion.anchoredCedula;
  }

  get selectedCount(): number {
    return this.seleccion.selectedCount;
  }

  get selectedOperadores(): Operador[] {
    const value = this.filtrarForm && this.filtrarForm.get('Operador')
      ? this.filtrarForm.get('Operador').value
      : null;
    return Array.isArray(value) ? value : [];
  }

  constructor(
    private translate: TranslateService,
    private registroService: DosimetriaService,
    private toasterService: ToasterService,
    private excelService: ExcelServicesService,
    private formBuilder: FormBuilder,
    private seleccion: DosimetriaHistoricoSeleccionService,
    private modalService: NgbModal,
  ) {
    this.construirForm();
    this.load_UserData();
    this.loadOptionsPeriodo();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((_event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  construirForm() {
    this.filtrarForm = this.formBuilder.group({
      Operador: [[]],
      Periodo: [[]],
      Identificacion_empleado: ['', Validators.compose([
        Validators.minLength(4),
        Validators.maxLength(15),
        Validators.pattern('^[0-9]+$'),
      ])],
      Nombre_empleado: [{ value: '', disabled: true }, Validators.compose([
        Validators.minLength(3),
        Validators.pattern('^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$'),
      ])],
      Apellido_empleado: [{ value: '', disabled: true }, Validators.compose([
        Validators.minLength(3),
        Validators.pattern('^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$'),
      ])],
    });

    this.registroForm = this.formBuilder.group({
      Rowspage: [200],
      Q: [''],
    });

    this.setupBusquedaEscalonada();
  }

  /** HU-10 §2.2: al ingresar documento válido se habilitan Nombre y Apellido. */
  private setupBusquedaEscalonada(): void {
    const idCtrl = this.filtrarForm.get('Identificacion_empleado');
    if (!idCtrl) { return; }
    this.docEscalonSub = idCtrl.valueChanges.subscribe((raw) => {
      const v = raw != null ? String(raw).trim() : '';
      const docOk = /^[0-9]{4,15}$/.test(v);
      this.setNombreApellidoEnabled(docOk);
    });
  }

  ngOnInit() {
    this.setupSearchDebounce();
    this.setupOperadorFilter();
  }

  ngOnDestroy() {
    if (this.searchSub) { this.searchSub.unsubscribe(); }
    if (this.dataSub) { this.dataSub.unsubscribe(); }
    if (this.userSub) { this.userSub.unsubscribe(); }
    if (this.operadorFilterSub) { this.operadorFilterSub.unsubscribe(); }
    if (this.docEscalonSub) { this.docEscalonSub.unsubscribe(); }
  }

  private setupOperadorFilter(): void {
    this.operadorFilterSub = this.operadorSearchCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => typeof value === 'string' ? value : (value && value.Nombres ? value.Nombres : '')),
    ).subscribe((term: string) => {
      this.filteredOperadores = this.filterOperadores(term);
    });
  }

  private filterOperadores(term: string): Operador[] {
    const selectedIds = new Set(this.selectedOperadores.map((o) => o && o.Id));
    const q = this.normalizeSearchText(term);
    return (this.Operador || []).filter((item: Operador) => {
      if (!item || selectedIds.has(item.Id)) { return false; }
      if (!q) { return true; }
      const name = this.normalizeSearchText(item.Nombres || '');
      return name.indexOf(q) !== -1;
    });
  }

  /** Quita tildes/diacríticos para búsqueda predictiva (ASPROMÉDICA ≈ aspromedica). */
  private normalizeSearchText(value: string): string {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  displayOperadorFn(item: Operador | string): string {
    if (item == null) { return ''; }
    if (typeof item === 'string') { return item; }
    return item.Nombres || '';
  }

  onOperadorSelected(event: MatAutocompleteSelectedEvent): void {
    const item = event && event.option ? event.option.value as Operador : null;
    if (!item || item.Id == null) { return; }
    const current = this.selectedOperadores.slice();
    if (!current.some((o) => o && o.Id === item.Id)) {
      current.push(item);
      this.filtrarForm.patchValue({ Operador: current });
    }
    this.operadorSearchCtrl.setValue('');
    this.filteredOperadores = this.filterOperadores('');
  }

  removeOperador(item: Operador): void {
    if (this.user_operador !== 0) { return; }
    const next = this.selectedOperadores.filter((o) => o && o.Id !== item.Id);
    this.filtrarForm.patchValue({ Operador: next });
    this.filteredOperadores = this.filterOperadores(
      typeof this.operadorSearchCtrl.value === 'string' ? this.operadorSearchCtrl.value : '',
    );
  }

  toggleSelectAllPeriodos(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const periodoControl = this.filtrarForm.get('Periodo');
    if (!periodoControl) { return; }
    const currentValue = periodoControl.value || [];
    if (currentValue.length >= this.Periodo.length) {
      periodoControl.setValue([]);
    } else {
      periodoControl.setValue([...this.Periodo]);
    }
  }

  /** Preview de años — mismo comportamiento aprobado en Dosimetría Histórico. */
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

  paginas(): void {
    const selected = Number(this.registroForm.get('Rowspage').value) || 200;
    this.pageSize = Math.min(Math.max(selected, 1), 200);
    this.currentPage = 1;
    this.syncTablePager();
    if (this.workerComunicadoMode) {
      this.totalPages = this.pageSize > 0 ? Math.ceil(this.totalRows / this.pageSize) : 0;
      this.source.setPaging(1, this.pageSize, true);
      return;
    }
    this.loadData();
  }

  private syncTablePager(): void {
    this.settings = Object.assign({}, this.settings, {
      pager: { perPage: this.pageSize, display: false },
    });
    this.source.setPaging(this.currentPage || 1, this.pageSize, false);
  }

  get totalPagesDisplay(): number {
    return this.totalPages > 0 ? this.totalPages : 1;
  }

  goToPage(page: number): void {
    const target = Math.min(Math.max(page, 1), this.totalPagesDisplay);
    if (target === this.currentPage && this.totalRows > 0) { return; }
    this.currentPage = target;
    if (this.workerComunicadoMode) {
      this.source.setPaging(this.currentPage, this.pageSize, true);
      return;
    }
    this.loadData();
  }

  nextPage(): void { this.goToPage(this.currentPage + 1); }
  prevPage(): void { this.goToPage(this.currentPage - 1); }
  firstPage(): void { this.goToPage(1); }
  lastPage(): void { this.goToPage(this.totalPagesDisplay); }

  goToPageFromInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const page = parseInt(input.value, 10);
    if (!Number.isNaN(page)) {
      this.goToPage(page);
    }
    input.value = String(this.currentPage);
  }

  buscar(): void {
    const idCtrl = this.filtrarForm.get('Identificacion_empleado');
    if (idCtrl && idCtrl.disabled) {
      idCtrl.enable({ emitEvent: false });
    }
    const idValue = idCtrl && idCtrl.value != null ? String(idCtrl.value).trim() : '';
    this.hasSearched = true;
    if (idValue) {
      this.consultarTrabajadorComunicado();
      return;
    }
    this.workerComunicadoMode = false;
    this.workerSubmitted = false;
    this.seleccion.resetCase();
    this.cargarCampos();
    this.currentPage = 1;
    this.q = (this.registroForm.get('Q') && this.registroForm.get('Q').value) || '';
    this.loadData();
  }

  private setupSearchDebounce(): void {
    const qControl = this.registroForm.get('Q');
    if (!qControl) { return; }
    this.searchSub = qControl.valueChanges.pipe(
      debounceTime(400),
      map((value: string) => (value || '').trim()),
      distinctUntilChanged(),
    ).subscribe((value: string) => {
      if (this.workerComunicadoMode) { return; }
      this.q = value;
      this.currentPage = 1;
      this.loadData();
    });
  }

  /** HU-10 §3.1: solo columnas obligatorias en grilla; detalle completo en modal. */
  cargarCampos() {
    const columns: any = {};
    if (this.workerComunicadoMode) {
      columns.Seleccionar = {
        title: '✔',
        type: 'custom',
        renderComponent: CheckboxRenderComponent,
        filter: false,
        editable: false,
        addable: false,
        onComponentInitFunction: (instance) => {
          instance.save.subscribe((row) => {
            this.seleccion.syncFromRow(row);
          });
        },
      };
    }

    Object.assign(columns, {
      EmpresaDosimetria: {
        title: 'Empresa de Dosimetría Personal',
        valuePrepareFunction: (_v, row) => {
          if (!row) { return ''; }
          return row.NombreOperador
            || row.Nombreoperador
            || (row.Operador && (row.Operador.Nombreoperador || row.Operador.Nombres))
            || '';
        },
      },
      Periodo: {
        title: 'Periodo de Reporte (Año)',
        valuePrepareFunction: (value) => value,
      },
      Entidad: {
        title: 'Entidad Contratante',
        valuePrepareFunction: (_v, row) => (row && (row.Nombreentidad || row.Nombre_Entidad)) || '',
      },
      Identificacion: {
        title: 'Identificación del Trabajador',
        valuePrepareFunction: (_v, row) =>
          (row && (row.Identificacionempleado || row.Documento_TOE)) || '',
      },
      Nombre: {
        title: 'Nombre del Trabajador',
        valuePrepareFunction: (_v, row) =>
          (row && (row.Nombreempleado || row.Nombres_TOE)) || '',
      },
      Apellido: {
        title: 'Apellido del Trabajador',
        valuePrepareFunction: (_v, row) =>
          (row && (row.Apellidoempleado || row.Apellidos_TOE)) || '',
      },
    });

    this.settings = {
      actions: false,
      mode: 'external',
      hideSubHeader: true,
      rowClassFunction: () => 'hu10-row-clickable',
      pager: {
        perPage: this.pageSize || 200,
        display: false,
      },
      columns,
    };
  }

  onRowSelect(event: any): void {
    if (!event || !event.data) { return; }
    // Clic reciente en checkbox: no abrir modal.
    const skipAt = event.data.__hu10SkipModalAt;
    if (skipAt && (Date.now() - Number(skipAt)) < 400) {
      delete event.data.__hu10SkipModalAt;
      return;
    }
    const modal = this.modalService.open(DosimetriaDetalleModalComponent, {
      size: 'lg',
      windowClass: 'hu10-modal',
    });
    modal.componentInstance.registro = event.data;
  }

  load_UserData(): void {
    this.userSub = this.registroService.user$.subscribe((user: any) => {
      this.user_operador = user && user.operador != null ? Number(user.operador) : 0;
      this.uid = user && user.id;
      this.isAdmin = Number(user && user.role) === 1 || this.user_operador === 0;
      this.loadOptionsOperador();
    });
  }

  compareById(o1, o2) {
    if (o1 == null || o2 == null) {
      return false;
    }
    return o1.Id === o2.Id;
  }

  loadOptionsOperador(): void {
    // Solo empresas de dosimetría (Energía no convencional, id_tipo_operador=8).
    const endpoint = this.user_operador === 0
      ? 'operador_light'
      : ('operador/' + this.user_operador);
    const req$ = this.user_operador === 0
      ? this.registroService.getWithParams(endpoint, { scope: 'dosimetria' })
      : this.registroService.get(endpoint);
    req$.subscribe((res) => {
      if (res !== null) {
        this.Operador = <Array<Operador>>res;
        this.filteredOperadores = this.filterOperadores('');
        if (this.user_operador !== 0 && this.Operador && this.Operador[0]) {
          this.filtrarForm.patchValue({ Operador: [this.Operador[0]] });
          this.operadorSearchCtrl.disable({ emitEvent: false });
        } else {
          this.operadorSearchCtrl.enable({ emitEvent: false });
        }
      }
    });
  }

  loadOptionsPeriodo(): void {
    this.registroService.getWithParams('periododosi', { scope: 'unificado' }).subscribe((res) => {
      if (res !== null) {
        this.Periodo = <Array<Periodo>>res;
      }
    });
  }

  Limpiar() {
    this.workerComunicadoMode = false;
    this.workerSubmitted = false;
    this.hasSearched = false;
    this.seleccion.resetCase();
    const limpiar: any = {
      Periodo: [],
      Identificacion_empleado: '',
      Nombre_empleado: '',
      Apellido_empleado: '',
    };
    if (this.user_operador === 0) {
      limpiar.Operador = [];
      this.operadorSearchCtrl.setValue('');
    }
    const idCtrl = this.filtrarForm.get('Identificacion_empleado');
    if (idCtrl) {
      idCtrl.enable({ emitEvent: false });
    }
    this.filtrarForm.patchValue(limpiar);
    this.setNombreApellidoEnabled(false);
    this.filteredOperadores = this.filterOperadores('');
    this.registroForm.patchValue({ Q: '' }, { emitEvent: false });
    this.q = '';
    this.currentPage = 1;
    this.totalRows = 0;
    this.totalPages = 0;
    this.source.load([]);
    this.excel = [];
    this.cargarCampos();
  }

  /** HU-4: nombre/apellido solo tras anclar cédula (consulta trabajador). */
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

  async toggleAllRows(): Promise<void> {
    const rows = await this.source.getAll();
    const selectedCount = rows.filter((r) => r.Selected).length;
    const newState = selectedCount < rows.length;
    rows.forEach((row) => {
      row.Selected = newState;
      row.SelectedId = newState ? (row.Id || row.id || row.local_id || row.ID) : null;
      this.seleccion.syncFromRow(row);
    });
    await this.source.load(rows);
  }

  consultarTrabajadorComunicado(): void {
    this.workerSubmitted = true;
    const idCtrl = this.filtrarForm.get('Identificacion_empleado');
    if (idCtrl && idCtrl.disabled) {
      idCtrl.enable({ emitEvent: false });
    }
    const filtros = this.filtrarForm.getRawValue();
    const idValue = idCtrl && idCtrl.value != null ? String(idCtrl.value).trim() : '';
    if (!idValue || (idCtrl && idCtrl.invalid)) {
      if (idCtrl) {
        const errs = idCtrl.errors || {};
        if (!idValue) {
          errs.required = true;
        }
        idCtrl.setErrors(errs);
        idCtrl.markAsTouched();
      }
      return;
    }

    let periodo: string | null = null;
    if (Array.isArray(filtros.Periodo) && filtros.Periodo.length) {
      periodo = filtros.Periodo
        .map((p) => (p ? (p.Id != null ? p.Id : p.Periodo) : null))
        .filter((id) => id != null && id !== '')
        .join('|');
      if (!periodo) { periodo = null; }
    } else if (filtros.Periodo != null && filtros.Periodo.Id != null) {
      periodo = String(filtros.Periodo.Id);
    } else if (filtros.Periodo != null && filtros.Periodo.Periodo != null) {
      periodo = String(filtros.Periodo.Periodo);
    }

    const nombre = filtros.Nombre_empleado != null ? String(filtros.Nombre_empleado).trim() : '';
    const apellido = filtros.Apellido_empleado != null ? String(filtros.Apellido_empleado).trim() : '';

    this.seleccion.setAnchor(idValue);
    this.workerComunicadoMode = true;
    this.cargarCampos();
    this.loading = true;

    // Misma lógica escalonada que Histórico: cédula + complemento nombre/apellido (docs ausentes/NR).
    const baseParams: { [key: string]: string | number } = {
      page: 1,
      pageSize: 500000,
      export: 1,
    };
    if (periodo) { baseParams.periodo = periodo; }
    if (this.user_operador !== 0) {
      baseParams.operador = String(this.user_operador);
    } else if (Array.isArray(filtros.Operador) && filtros.Operador.length) {
      const ops = filtros.Operador
        .map((o) => (o && o.Id != null ? o.Id : null))
        .filter((id) => id != null && id !== 0)
        .join('|');
      if (ops) { baseParams.operador = ops; }
    }

    const mapWorkerRow = (row: any) => {
      this.flattenRow(row);
      row.Nombreoperador = row.NombreOperador
        || (row.Operador && row.Operador.Nombreoperador)
        || '';
      row.local_id = row.Id;
      return row;
    };

    const isDocAusenteNr = (doc: any): boolean => {
      if (doc == null) { return true; }
      const s = String(doc).trim().toUpperCase();
      return !s || s === 'NR' || s === 'NP' || s === 'N/A' || s === 'NA';
    };

    const matchesNombreApellido = (row: any): boolean => {
      const n = String(row.Nombreempleado || '').toUpperCase();
      const a = String(row.Apellidoempleado || '').toUpperCase();
      if (nombre && n.indexOf(nombre.toUpperCase()) < 0) { return false; }
      if (apellido && a.indexOf(apellido.toUpperCase()) < 0) { return false; }
      return true;
    };

    const primary$ = this.registroService.getWithParams('reportedosimetriaunificado', {
      ...baseParams,
      id_empleado: idValue,
    });

    const complementQ = nombre || apellido;
    const complement$ = complementQ
      ? this.registroService.getWithParams('reportedosimetriaunificado', {
          ...baseParams,
          q: complementQ,
        }).pipe(catchError(() => of({ data: [] })))
      : of({ data: [] });

    primary$.pipe(
      switchMap((resPrimary) => {
        const payload: any = resPrimary;
        const primaryRaw = <Array<any>>(Array.isArray(payload) ? payload : (payload && payload.data) || []);
        return complement$.pipe(map((resComp: any) => {
          const compRaw = <Array<any>>(Array.isArray(resComp) ? resComp : (resComp && resComp.data) || []);
          const complement = compRaw
            .filter((r) => isDocAusenteNr(r.Identificacionempleado))
            .filter((r) => matchesNombreApellido(r));
          const byId = new Map<string, any>();
          primaryRaw.concat(complement).forEach((r) => {
            const key = r && r.Id != null ? String(r.Id) : '';
            if (key) { byId.set(key, r); }
          });
          return Array.from(byId.values()).map(mapWorkerRow);
        }));
      }),
    ).subscribe((data) => {
      this.loading = false;
      if (idCtrl) {
        idCtrl.disable({ emitEvent: false });
      }
      // Nombre/apellido siguen habilitados (como Histórico §2.2) para complementar.
      const merged = this.seleccion.mergeResultRows(data);
      merged.sort(sortHistoricTableRows);
      this.pageSize = Math.min(Math.max(Number(this.registroForm.get('Rowspage').value) || this.pageSize || 200, 1), 200);
      this.totalRows = merged.length;
      this.totalPages = this.pageSize > 0 ? Math.ceil(this.totalRows / this.pageSize) : 0;
      this.currentPage = 1;
      this.syncTablePager();
      this.source.load(merged);
      this.source.setPaging(1, this.pageSize, true);
      if (!merged.length) {
        this.showToast(
          'info',
          'Sin resultados',
          'No hay registros en Dosimetría Unificado para la cédula ' + idValue + '.',
        );
      }
    }, (err) => {
      this.loading = false;
      this.showToast(
        'error',
        'Error al consultar trabajador',
        this.describeHttpError(err, 'No se pudo consultar el historial del trabajador en Unificado (cédula + nombre/apellido).'),
      );
    });
  }

  /**
   * HU-10 §1: Descargar resumen de reportes — grilla Excel.
   * Por cédula: solo registros seleccionados.
   */
  descargarResumen(): void {
    if (this.workerComunicadoMode) {
      this.exportSelectedResumen();
      return;
    }
    this.exportAsXLSX();
  }

  /** Misma lógica que el antiguo «Descargar comunicado» (Word HU-6). */
  descargarHistorialDosimetrico(): void {
    const selectedIds = this.seleccion.selectedIds;
    if (!selectedIds.length) {
      this.showToast('warning', 'Advertencia', 'Debe seleccionar al menos un registro');
      return;
    }
    this.loading = true;
    this.registroService.post('reportehistoricodosimetria/doc', { local_ids: selectedIds })
      .subscribe((resp: { filename: string; mime: string; base64: string }) => {
        this.loading = false;
        this.descargarBase64(resp.base64, resp.mime, resp.filename || 'REPORTE_HISTORIAL_DOSIMETRIA.docx');
      }, (err) => {
        this.loading = false;
        this.showToast('error', 'Error al generar historial', this.describeHttpError(err, 'No se pudo generar el historial dosimétrico.'));
      });
  }

  private async exportSelectedResumen(): Promise<void> {
    const selectedIds = new Set((this.seleccion.selectedIds || []).map((id) => String(id)));
    if (!selectedIds.size) {
      this.showToast('warning', 'Advertencia', 'Debe seleccionar al menos un registro');
      return;
    }
    try {
      const rows = await this.source.getAll();
      const selected = (rows || []).filter((row) => {
        const id = row && (row.Id != null ? row.Id : (row.local_id != null ? row.local_id : row.SelectedId));
        return id != null && selectedIds.has(String(id));
      });
      if (!selected.length) {
        this.showToast('warning', 'Sin datos', 'No hay filas seleccionadas para exportar.');
        return;
      }
      const excelRows = selected.map((row) => this.toExcelRow(this.flattenRow(row)));
      this.excelService.exportAsExcelFileConUmbrales(excelRows, 'dosimetria_unificado_seleccion');
    } catch (err) {
      this.showToast('error', 'Error al exportar', 'No se pudo exportar el resumen de los registros seleccionados.');
    }
  }

  private descargarBase64(base64: string, mime: string, nombre: string): void {
    const byteCharacters = atob(base64);
    const byteArrays: Uint8Array[] = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    const blob = new Blob(byteArrays, { type: mime });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private buildQueryParams(exportMode = false): { [key: string]: string | number } {
    const filtros = this.filtrarForm.getRawValue();
    let operador: any = null;
    let periodo: any = null;
    let id_empleado: any = null;

    if (this.user_operador !== 0) {
      operador = String(this.user_operador);
    } else if (Array.isArray(filtros.Operador) && filtros.Operador.length) {
      // Pipe evita que proxies/parseadores partan la lista por comas
      operador = filtros.Operador
        .map((o) => (o && o.Id != null ? o.Id : null))
        .filter((id) => id != null && id !== 0)
        .join('|');
      if (!operador) { operador = null; }
    }

    if (Array.isArray(filtros.Periodo) && filtros.Periodo.length) {
      periodo = filtros.Periodo
        .map((p) => (p ? (p.Id != null ? p.Id : p.Periodo) : null))
        .filter((id) => id != null && id !== '' && id !== 0)
        .join('|');
      if (!periodo) { periodo = null; }
    } else if (filtros.Periodo != null && !Array.isArray(filtros.Periodo)) {
      periodo = filtros.Periodo.Id != null ? filtros.Periodo.Id : filtros.Periodo.Periodo;
    }

    if (filtros.Identificacion_empleado != null && filtros.Identificacion_empleado !== '') {
      id_empleado = filtros.Identificacion_empleado;
    }

    this.q = (this.registroForm.get('Q') && this.registroForm.get('Q').value) || this.q || '';
    const pageSize = exportMode
      ? 500000
      : Math.min(Math.max(Number(this.registroForm.get('Rowspage').value) || this.pageSize || 200, 1), 200);

    const queryParams: { [key: string]: string | number } = {
      page: exportMode ? 1 : this.currentPage,
      pageSize,
    };
    if (exportMode) { queryParams.export = 1; }
    if (this.q) { queryParams.q = String(this.q).trim(); }
    if (operador != null && operador !== 0 && operador !== '') { queryParams.operador = operador; }
    if (periodo != null && periodo !== 0 && periodo !== '') { queryParams.periodo = periodo; }
    if (id_empleado != null) { queryParams.id_empleado = id_empleado; }
    return queryParams;
  }

  private flattenRow(row: any): any {
    if (row.Datosempleado) {
      row.Fecha_nacimiento = row.fecha_nacimiento;
      row.Genero_empleado = row.Datosempleado.Genero_empleado && row.Datosempleado.Genero_empleado.Nombre;
      row.Nivel_educacion = row.Datosempleado.Nivel_educacion && row.Datosempleado.Nivel_educacion.Nombre;
      row.Titulo = row.Datosempleado.Titulo;
    } else {
      if (row.Fecha_nacimiento == null) { row.Fecha_nacimiento = row.fecha_nacimiento; }
      if (row.Genero_empleado == null) { row.Genero_empleado = row.Genero; }
      if (row.Nivel_educacion == null) { row.Nivel_educacion = row.NivelEducacion; }
    }
    if (row.Reportedosimetria) {
      row.Fecha_inicio_exposicion_empleado = row.fecha_inicio_exposicion;
      row.Fecha_fin_exposicion_empleado = row.fecha_fin_exposicion;
      row.Frecuencia_medicion = row.FrecuenciaMedicion;
      row.Frecuencia_cambio = row.frecuencia_cambio;
      row.Practica_ri = row.PracticaRI ? row.PracticaRI : '';
      row.Tipo_dosimetro = row.TipoDosimetro;
      row.Tecnologia_dosimetro = row.TecnologiaDosimetro;
      row.Hp_mSv_Enero = row.Reportedosimetria.Hp_mSv_Enero;
      row.Hp_mSv_Febrero = row.Reportedosimetria.Hp_mSv_Febrero;
      row.Hp_mSv_Marzo = row.Reportedosimetria.Hp_mSv_Marzo;
      row.Hp_mSv_Abril = row.Reportedosimetria.Hp_mSv_Abril;
      row.Hp_mSv_Mayo = row.Reportedosimetria.Hp_mSv_Mayo;
      row.Hp_mSv_Junio = row.Reportedosimetria.Hp_mSv_Junio;
      row.Hp_mSv_Julio = row.Reportedosimetria.Hp_mSv_Julio;
      row.Hp_mSv_Agosto = row.Reportedosimetria.Hp_mSv_Agosto;
      row.Hp_mSv_Septiembre = row.Reportedosimetria.Hp_mSv_Septiembre;
      row.Hp_mSv_Octubre = row.Reportedosimetria.Hp_mSv_Octubre;
      row.Hp_mSv_Noviembre = row.Reportedosimetria.Hp_mSv_Noviembre;
      row.Hp_mSv_Diciembre = row.Reportedosimetria.Hp_mSv_Diciembre;
      row.Total_mSv = row.Reportedosimetria.Total_mSv != null
        ? row.Reportedosimetria.Total_mSv
        : row.total_mSv;
      row.Hp_acumulado = row.Reportedosimetria.Hp_acumulado != null
        ? row.Reportedosimetria.Hp_acumulado
        : row.hp_acumulado;
    } else {
      if (row.Frecuencia_medicion == null) { row.Frecuencia_medicion = row.FrecuenciaMedicion; }
      if (row.Practica_ri == null) { row.Practica_ri = row.PracticaRI || ''; }
      if (row.Tipo_dosimetro == null) { row.Tipo_dosimetro = row.TipoDosimetro; }
      if (row.Tecnologia_dosimetro == null) { row.Tecnologia_dosimetro = row.TecnologiaDosimetro; }
      if (row.Fecha_inicio_exposicion_empleado == null) {
        row.Fecha_inicio_exposicion_empleado = row.fecha_inicio_exposicion;
      }
      if (row.Fecha_fin_exposicion_empleado == null) {
        row.Fecha_fin_exposicion_empleado = row.fecha_fin_exposicion;
      }
      if (row.Hp_mSv_Enero == null) { row.Hp_mSv_Enero = row.hp_msv_enero; }
      if (row.Hp_mSv_Febrero == null) { row.Hp_mSv_Febrero = row.hp_msv_febrero; }
      if (row.Hp_mSv_Marzo == null) { row.Hp_mSv_Marzo = row.hp_msv_marzo; }
      if (row.Hp_mSv_Abril == null) { row.Hp_mSv_Abril = row.hp_msv_abril; }
      if (row.Hp_mSv_Mayo == null) { row.Hp_mSv_Mayo = row.hp_msv_mayo; }
      if (row.Hp_mSv_Junio == null) { row.Hp_mSv_Junio = row.hp_msv_junio; }
      if (row.Hp_mSv_Julio == null) { row.Hp_mSv_Julio = row.hp_msv_julio; }
      if (row.Hp_mSv_Agosto == null) { row.Hp_mSv_Agosto = row.hp_msv_agosto; }
      if (row.Hp_mSv_Septiembre == null) { row.Hp_mSv_Septiembre = row.hp_msv_septiembre; }
      if (row.Hp_mSv_Octubre == null) { row.Hp_mSv_Octubre = row.hp_msv_octubre; }
      if (row.Hp_mSv_Noviembre == null) { row.Hp_mSv_Noviembre = row.hp_msv_noviembre; }
      if (row.Hp_mSv_Diciembre == null) { row.Hp_mSv_Diciembre = row.hp_msv_diciembre; }
      if (row.Total_mSv == null) { row.Total_mSv = row.total_mSv; }
      if (row.Hp_acumulado == null) { row.Hp_acumulado = row.hp_acumulado; }
    }
    return row;
  }

  /** HU-10 §3.2.1: copia fiel de las 36 columnas del formato de ingesta (A–AJ). */
  private toExcelRow(row: any): any {
    const tipo = row.Tipo_dosimetro != null ? row.Tipo_dosimetro
      : (row.TipoDosimetro != null ? row.TipoDosimetro : '');
    return {
      Nit_Entidad: row.Identificacionentidad,
      Nombre_Entidad: row.Nombreentidad,
      Municipio_Entidad: !row.Municipio || row.Municipio.NombreMunicipio === 'Todos' ? 'NR' : row.Municipio.NombreMunicipio,
      Codigo_Municipio: !row.Municipio || row.Municipio.Codigo === 'Todos' ? 'NR' : row.Municipio.Codigo,
      Codigo_Departamento: row.Departamento ? row.Departamento.Codigo : 'NR',
      Direccion_Entidad: row.Direccionentidad,
      Correo_Entidad: row.Correoentidad,
      Documento_Trabajador: row.Identificacionempleado,
      Nombres_Trabajador: row.Nombreempleado,
      Apellidos_Trabajador: row.Apellidoempleado,
      Fecha_nacimiento_Trabajador: this.utilidadesService.formatDate(row.Fecha_nacimiento),
      Genero_Trabajador: row.Genero_empleado,
      Nivel_educacion_Trabajador: row.Nivel_educacion === 'No reporta' ? 'NR' : row.Nivel_educacion,
      Titulo_Trabajador: row.Titulo,
      Fecha_inicio_exposicion_Trabajador: this.utilidadesService.formatDate(row.Fecha_inicio_exposicion_empleado),
      Fecha_fin_exposicion_Trabajador: this.utilidadesService.formatDate(row.Fecha_fin_exposicion_empleado),
      Frecuencia_medicion: row.Frecuencia_medicion === 'No reporta' ? 'NR' : row.Frecuencia_medicion,
      Modifica_frecuencia_medicion: row.Frecuencia_cambio,
      Practica_RI: row.Practica_ri,
      Tipo_dosimetro: tipo, // Columna T — §3.2.1.1 / §3.2.1.2
      Tecnologia_dosimetro: row.Tecnologia_dosimetro,
      Hp_mSv_Enero: this.utilidadesService.formatDosisMes(row.Hp_mSv_Enero),
      Hp_mSv_Febrero: this.utilidadesService.formatDosisMes(row.Hp_mSv_Febrero),
      Hp_mSv_Marzo: this.utilidadesService.formatDosisMes(row.Hp_mSv_Marzo),
      Hp_mSv_Abril: this.utilidadesService.formatDosisMes(row.Hp_mSv_Abril),
      Hp_mSv_Mayo: this.utilidadesService.formatDosisMes(row.Hp_mSv_Mayo),
      Hp_mSv_Junio: this.utilidadesService.formatDosisMes(row.Hp_mSv_Junio),
      Hp_mSv_Julio: this.utilidadesService.formatDosisMes(row.Hp_mSv_Julio),
      Hp_mSv_Agosto: this.utilidadesService.formatDosisMes(row.Hp_mSv_Agosto),
      Hp_mSv_Septiembre: this.utilidadesService.formatDosisMes(row.Hp_mSv_Septiembre),
      Hp_mSv_Octubre: this.utilidadesService.formatDosisMes(row.Hp_mSv_Octubre),
      Hp_mSv_Noviembre: this.utilidadesService.formatDosisMes(row.Hp_mSv_Noviembre),
      Hp_mSv_Diciembre: this.utilidadesService.formatDosisMes(row.Hp_mSv_Diciembre),
      Hp_Acumulado: this.utilidadesService.formatNumber(row.Hp_acumulado), // Columna AH
      Observaciones_dosis_notificacion: row.Observaciones_dosis || row.Observaciones_dosis_notificacion || '',
      Observaciones_generales: row.Observaciones || row.Observaciones_generales || '',
    };
  }

  loadData(): void {
    if (this.workerComunicadoMode) {
      return;
    }
    if (this.dataSub) {
      this.dataSub.unsubscribe();
      this.dataSub = null;
    }

    const pageSize = Math.min(Math.max(Number(this.registroForm.get('Rowspage').value) || this.pageSize || 200, 1), 200);
    this.pageSize = pageSize;
    this.syncTablePager();

    this.loading = true;
    this.dataSub = this.registroService.getWithParams('reportedosimetriaunificado', this.buildQueryParams(false))
      .subscribe((res) => {
        this.loading = false;
        if (res == null) { return; }
        const payload: any = res;
        const data = <Array<any>>(Array.isArray(payload) ? payload : (payload.data || []));
        this.totalRows = Array.isArray(payload) ? data.length : (payload.total || 0);
        this.currentPage = Array.isArray(payload) ? 1 : (payload.page || this.currentPage);
        this.pageSize = Array.isArray(payload) ? data.length : (payload.pageSize || this.pageSize);
        this.totalPages = this.pageSize > 0 ? Math.ceil(this.totalRows / this.pageSize) : 0;

        for (let i = 0; i < data.length; i++) {
          this.flattenRow(data[i]);
        }

        this.source.load(data);
        this.source.setPaging(1, this.pageSize, true);
        this.excel = data.map((row) => this.toExcelRow(row));

        if (this.totalRows === 0) {
          this.showToast('info', 'Sin resultados', this.buildEmptyResultMessage());
        }
      }, (err) => {
        this.loading = false;
        this.source.load([]);
        this.totalRows = 0;
        this.totalPages = 0;
        this.showToast(
          'error',
          'Error al consultar',
          this.describeHttpError(err, 'No se pudo consultar Dosimetría Unificado.'),
        );
      });
  }

  /**
   * Descarga TODOS los registros del filtro (empresa/periodo), no solo la página en pantalla.
   * Usa export=1 + pageSize grande y, si hace falta, recorre páginas hasta completar el total.
   */
  exportAsXLSX(): void {
    if (this.loading) { return; }
    this.loading = true;
    this.fetchAllForExport()
      .then((rawRows) => {
        this.loading = false;
        if (!rawRows.length) {
          this.showToast('warning', 'Sin datos', this.buildEmptyResultMessage());
          return;
        }
        const rows = rawRows.map((r) => this.toExcelRow(this.flattenRow(r)));
        this.excelService.exportAsExcelFileConUmbrales(rows, 'dosimetria_unificado');
        this.showToast(
          'info',
          'Resumen de reportes',
          'Se exportaron ' + rows.length + ' registro(s) con el filtro aplicado (no solo la página visible).',
        );
      })
      .catch((err) => {
        this.loading = false;
        this.showToast(
          'error',
          'Error al exportar',
          this.describeHttpError(err, 'No se pudo exportar Dosimetría Unificado.'),
        );
      });
  }

  /** Trae el universo filtrado completo (todas las páginas) para el Excel resumen. */
  private fetchAllForExport(): Promise<any[]> {
    // Tope por petición (SP AllowLargePage). Si hay más, se siguen páginas.
    const chunkSize = 500000;
    const base = this.buildQueryParams(true);
    base.page = 1;
    base.pageSize = chunkSize;
    base.export = 1;

    const loadPage = (page: number, acc: any[], totalHint: number): Promise<any[]> => {
      const params = Object.assign({}, base, { page, pageSize: chunkSize, export: 1 });
      return this.registroService.getWithParams('reportedosimetriaunificado', params)
        .toPromise()
        .then((res: any) => {
          const batch = (res && res.data) || [];
          const total = res && res.total != null ? Number(res.total) : totalHint;
          const merged = acc.concat(batch);
          if (!batch.length) { return merged; }
          if (total > 0 && merged.length >= total) { return merged; }
          if (batch.length < chunkSize) { return merged; }
          return loadPage(page + 1, merged, total);
        });
    };

    return loadPage(1, [], 0);
  }

  private buildEmptyResultMessage(): string {
    const empresas = this.selectedOperadores
      .map((o) => (o && o.Nombres ? o.Nombres : null))
      .filter(Boolean);
    const periodos = Array.isArray(this.filtrarForm.get('Periodo').value)
      ? this.filtrarForm.get('Periodo').value.map((p) => p && (p.Periodo || p.Id)).filter(Boolean)
      : [];
    const parts: string[] = [];
    if (empresas.length) {
      parts.push('empresas: ' + empresas.join(', '));
    }
    if (periodos.length && periodos.length < this.Periodo.length) {
      parts.push('periodos: ' + periodos.join(', '));
    }
    const filtroTxt = parts.length ? ` (${parts.join(' | ')})` : '';
    return 'No hay registros en Dosimetría Unificado con los filtros aplicados'
      + filtroTxt
      + '. Si la empresa es reciente, verifique que ya esté sincronizada (tipado/histórico → unificado).';
  }

  private describeHttpError(err: any, fallback: string): string {
    if (!err) { return fallback; }
    const status = err.status != null ? Number(err.status) : null;
    const body = err.error;
    let serverMsg = '';
    if (typeof body === 'string' && body.trim()) {
      serverMsg = body.trim();
    } else if (body && typeof body === 'object') {
      serverMsg = String(body.message || body.error || body.msg || '').trim();
    }
    if (!serverMsg && err.message && String(err.message).indexOf('Http failure') === -1) {
      serverMsg = String(err.message);
    }

    if (status === 0) {
      return 'Sin conexión con la API. Verifique red o que el servicio esté activo.';
    }
    if (status === 401) {
      return 'Sesión expirada o no autorizada. Vuelva a iniciar sesión.';
    }
    if (status === 403) {
      return 'No tiene permisos para consultar Dosimetría Unificado.';
    }
    if (status === 404) {
      return 'Servicio no encontrado (API desactualizada o ruta incorrecta).';
    }
    if (status === 408 || status === 504) {
      return 'La consulta tardó demasiado. Pruebe filtrar por empresa y/o periodo.';
    }
    if (status != null && status >= 500) {
      return serverMsg
        ? `Error del servidor (${status}): ${serverMsg}`
        : `Error interno del servidor (HTTP ${status}).`;
    }
    if (serverMsg) {
      return status != null ? `${serverMsg} (HTTP ${status})` : serverMsg;
    }
    return status != null ? `${fallback} (HTTP ${status})` : fallback;
  }

  private showToast(type: string, title: string, body: string): void {
    this.config = new ToasterConfig({
      positionClass: 'toast-top-right',
      timeout: 8000,
      newestOnTop: true,
      tapToDismiss: true,
      preventDuplicates: false,
      animation: 'fade',
      limit: 5,
    });
    const toast: Toast = {
      type,
      title,
      body,
      timeout: 8000,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
  }
}
