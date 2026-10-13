// ==============================================================================
// PROYECTO: SIVEEIC
// AUTOR: Carlos Díaz
// MODIFICADO POR: Johan Piñeres
// CONTACTO: johanpineres@gmail.com
// CELULAR: 3003241133
// FECHA: 2026-08-24
// DESCRIPCIÓN: Componente Angular para la ingesta, panel de filtros, validación y sincronización SOAP MinCIT (HU-009)
//
// HISTORIAL DE CAMBIOS:
// - 2025-12-06 - CREACIÓN DEL ARCHIVO: Formulario cargue mincit - Carlos Díaz
// - 2026-03-27 - MODIFICACIÓN: Ajuste componente visual cargue solicitudes - Paulo César Guillén Rojas
// - 2026-08-05 - MODIFICACIÓN: Implementación de filtros de búsqueda, grilla SmartTable y trazabilidad VUCE - Johan Piñeres
// - 2026-08-06 - MODIFICACIÓN: Rediseño de filtros VUCE reales, exportación CSV y paginación parametrizable - Johan Piñeres
// - 2026-08-13 - MODIFICACIÓN: Integración del panel de interoperabilidad y auditoría de la HU-008 - Johan Piñeres
// - 2026-08-24 - MODIFICACIÓN: Panel de sincronización y visualización de solicitudes finalizadas SOAP MinCIT (HU-009) - Johan Piñeres
// ==============================================================================
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import 'style-loader!angular2-toaster/toaster.css';

import { DosimetriaService } from '../../../@core/data/services/dosimetria.service';

@Component({
  selector: 'app-mincit-process',
  templateUrl: './mincit-process.component.html',
  styleUrls: ['./mincit-process.component.scss']
})
export class MincitProcessComponent implements OnInit, AfterViewInit {

  // Variables para carga de archivo
  archivoSeleccionado: File | null = null;
  nombreArchivo: string = '';
  cargando: boolean = false;
  cargandoGrilla: boolean = false;

  // SmartTable & Formulario de Filtros VUCE (T-2.1 y T-2.2)
  source: LocalDataSource = new LocalDataSource();
  settings: any;
  filtrarForm: FormGroup;
  
  // [2026-08-24] ADD: SmartTable y variables para Solicitudes Finales SOAP MinCIT (HU-009) - Johan Piñeres
  sourceFinales: LocalDataSource = new LocalDataSource();
  settingsFinales: any;
  cargandoFinales: boolean = false;
  sincronizandoSoap: boolean = false;
  pageSizeFinales: number = 10;

  // Listas para los selects
  Operador = [];
  Radionuclido = [];
  
  // Respuesta del servidor
  respuesta: any = null;
  tieneErrores: boolean = false;

  // Configuración del toaster
  config: ToasterConfig;

  constructor(
    private translate: TranslateService,
    private registroService: DosimetriaService,
    private toasterService: ToasterService,
    private formBuilder: FormBuilder
  ) {
    this.config = new ToasterConfig({
      positionClass: 'toast-top-right',
      timeout: 5000,
      newestOnTop: true,
      tapToDismiss: true,
      preventDuplicates: false,
      animation: 'fade',
      limit: 5,
    });

    this.construirForm();
    this.configurarSmartTable();
    this.configurarSmartTableFinales();
  }

  ngOnInit() {
    this.loadOptionsRadionuclido();
    this.loadData();
    this.loadSolicitudesFinales();
  }

  // [2026-08-06] ADD: Carga de catálogo de radionúclidos reales - Johan Piñeres
  loadOptionsRadionuclido() {
    this.registroService.get('catalogos/radionuclidos').subscribe((res: any) => {
      this.Radionuclido = res || ['Am-Be', 'Co-57', 'Cs-137', 'H3', 'I-131', 'Ir-192', 'Lu-177', 'Mo-99/Tc-99m', 'Ra-223'];
    }, err => {
      this.Radionuclido = ['Am-Be', 'Co-57', 'Cs-137', 'H3', 'I-131', 'Ir-192', 'Lu-177', 'Mo-99/Tc-99m', 'Ra-223'];
    });
  }

  ngAfterViewInit() {
  }

  // [2026-08-06] MOD: Formulario con campos de negocio reales VUCE (Radionuclido, NoAutorizacion, FormaFisica, Subpartida, Operador, RAN) - Johan Piñeres
  construirForm() {
    this.filtrarForm = this.formBuilder.group({
      Operador: [null],
      Radionuclido: [null],
      NumeroAutorizacion: [''],
      FormaFisica: [null],
      Subpartida: [''],
      NumeroSolicitud: ['', Validators.compose([Validators.maxLength(10)])]
    });
  }

  // [2026-08-06] MOD: Configuración de paginación parametrizable y columnas SmartTable VUCE - Johan Piñeres
  pageSize: number = 10;
  configurarSmartTable() {
    this.settings = {
      actions: false,
      noDataMessage: 'No se encontraron solicitudes VUCE cargadas',
      pager: {
        display: true,
        perPage: this.pageSize
      },
      columns: {
        NumeroSolicitud: { title: 'RAN', type: 'string' },
        Importador: { title: 'Importador', type: 'string' },
        Nit: { title: 'NIT', type: 'string' },
        NumeroAutorizacion: { title: 'No. Autorización', type: 'string' },
        SubpartidaArancelaria: { title: 'Subpartida', type: 'string' },
        Radionuclido: { title: 'Radionúclido', type: 'string' },
        Cantidad: { title: 'Cantidad', type: 'number' },
        Actividad: { title: 'Actividad', type: 'number' },
        NombreProveedor: { title: 'Proveedor', type: 'string' }
      }
    };
  }

  // [2026-08-06] ADD: Cambiar dinámicamente el tamaño de página de la grilla SmartTable - Johan Piñeres
  onPageSizeChange(newSize: number) {
    this.pageSize = Number(newSize);
    this.source.setPaging(1, this.pageSize, true);
  }

  // [2026-08-24] ADD: Configuración de SmartTable para Solicitudes Finales SOAP MinCIT (HU-009) - Johan Piñeres
  configurarSmartTableFinales() {
    this.settingsFinales = {
      actions: false,
      noDataMessage: 'No se encontraron solicitudes finales sincronizadas desde MinCIT',
      pager: {
        display: true,
        perPage: this.pageSizeFinales
      },
      columns: {
        NumeroTemporal: { title: 'No. Temporal', type: 'string' },
        NumeroFinal: { title: 'No. Final VUCE', type: 'string' },
        ConceptoEntidad: { title: 'Concepto MME', type: 'string' },
        ConceptoMincit: { title: 'Concepto MinCIT', type: 'string' },
        FechaSolicitud: { 
          title: 'Fecha Solicitud', 
          type: 'string',
          valuePrepareFunction: (val) => val ? String(val).substring(0, 10) : ''
        },
        FechaAprobacion: { 
          title: 'Fecha Decisión', 
          type: 'string',
          valuePrepareFunction: (val, row) => (val || row.FechaRechazo) ? String(val || row.FechaRechazo).substring(0, 10) : ''
        },
        NombreImportador: { title: 'Importador', type: 'string' },
        EstadoConfirmacion: {
          title: 'Confirmado MinCIT',
          type: 'html',
          valuePrepareFunction: (val) => val === 1 ? '<span class="badge badge-success">SÍ</span>' : '<span class="badge badge-warning">PENDIENTE</span>'
        },
        FechaRecepcion: {
          title: 'Fecha Sincronización',
          type: 'string',
          valuePrepareFunction: (val) => val ? String(val).substring(0, 19).replace('T', ' ') : ''
        }
      }
    };
  }

  // [2026-08-24] ADD: Paginación para grilla de Solicitudes Finales SOAP - Johan Piñeres
  onPageSizeFinalesChange(newSize: number) {
    this.pageSizeFinales = Number(newSize);
    this.sourceFinales.setPaging(1, this.pageSizeFinales, true);
  }

  // [2026-08-24] ADD: Carga de solicitudes finales persistidas en BD SIVEEIC (HU-009) - Johan Piñeres
  loadSolicitudesFinales() {
    this.cargandoFinales = true;
    this.registroService.get('mincit/solicitudes-finales').subscribe(
      (res: any) => {
        this.cargandoFinales = false;
        const lista = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
        this.sourceFinales.load(lista);
      },
      (err) => {
        this.cargandoFinales = false;
        console.error('Error cargando solicitudes finales MinCIT:', err);
      }
    );
  }

  // [2026-08-24] ADD: Disparo manual de sincronización SOAP MinCIT (HU-009) - Johan Piñeres
  sincronizarSoapDiario() {
    this.sincronizandoSoap = true;
    this.showToast('info', 'Sincronizando', 'Consultando servicio SOAP de MinCIT...');

    this.registroService.post('mincit/sincronizar-diario', {}).subscribe(
      (resp: any) => {
        this.sincronizandoSoap = false;
        if (resp && resp.exito) {
          this.showToast('success', 'Éxito', `Sincronización finalizada. Solicitudes recibidas: ${resp.totalRecibidas || 0}, procesadas: ${resp.totalProcesadas || 0}`);
          this.loadSolicitudesFinales();
        } else {
          this.showToast('warning', 'Aviso', (resp && resp.mensaje) ? resp.mensaje : 'La sincronización finalizó con advertencias');
        }
      },
      (err) => {
        this.sincronizandoSoap = false;
        console.error('Error en sincronización SOAP MinCIT:', err);
        const errMsg = (err && err.error && err.error.error) || (err && err.error && err.error.message) || 'Error al conectar con el servicio SOAP de MinCIT';
        this.showToast('error', 'Fallo de Sincronización', errMsg);
      }
    );
  }

  // [2026-08-13] MOD: Consulta de importadores únicos reales de VUCE en lugar de los operadores generales del sitio - Johan Piñeres
  operadoresCargados: boolean = false;
  loadOptionsOperador() {
    if (this.operadoresCargados) return;
    this.operadoresCargados = true;
    this.registroService.get('importadores_vuce').subscribe((res: any) => {
      this.Operador = res || [];
    }, err => {
      this.operadoresCargados = false;
      console.error('Error cargando importadores VUCE:', err);
    });
  }

  // [2026-08-06] MOD: Comparador generico de objetos por Id para selects de Angular - Johan Piñeres
  compareById(item1, item2) {
    if (!item1 || !item2) return item1 === item2;
    const id1 = item1.id_departamento || item1.id_municipio || item1.Id || item1.id;
    const id2 = item2.id_departamento || item2.id_municipio || item2.Id || item2.id;
    return id1 && id2 ? id1 === id2 : item1 === item2;
  }

  // [2026-08-06] MOD: Consulta de solicitudes VUCE enviando parametros de filtro reales VUCE en URL - Johan Piñeres
  loadData() {
    this.cargandoGrilla = true;
    const formVals = this.filtrarForm ? this.filtrarForm.value : {};
    
    let params: any = {};
    if (formVals.NumeroSolicitud) {
      params.NumeroSolicitud = formVals.NumeroSolicitud;
    }
    if (formVals.NumeroAutorizacion) {
      params.NumeroAutorizacion = formVals.NumeroAutorizacion;
    }
    if (formVals.Radionuclido) {
      params.Radionuclido = formVals.Radionuclido;
    }
    if (formVals.FormaFisica) {
      params.FormaFisica = formVals.FormaFisica;
    }
    if (formVals.Operador) {
      params.Importador = formVals.Operador.Nombres || formVals.Operador.Nroidentificacion || formVals.Operador;
    }
    if (formVals.Subpartida) {
      params.Subpartida = formVals.Subpartida;
    }

    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `carga_rais?${queryString}` : 'carga_rais';

    this.registroService.get(endpoint).subscribe(
      (data: any) => {
        this.cargandoGrilla = false;
        const lista = Array.isArray(data) ? data : (data.data || []);
        this.source.load(lista);
      },
      (error) => {
        this.cargandoGrilla = false;
        console.error('Error al cargar datos VUCE:', error);
        this.showToast('error', 'Error', 'No se pudieron consultar los registros de VUCE');
      }
    );
  }

  // [2026-08-05] MOD: Exportación real a Excel/CSV del resumen de solicitudes VUCE - Johan Piñeres
  downloadResumen() {
    this.source.getAll().then(data => {
      if (!data || data.length === 0) {
        this.showToast('warning', 'Advertencia', 'No hay datos en la grilla para exportar');
        return;
      }

      this.showToast('info', 'Exportando', 'Generando resumen de reportes VUCE...');
      
      const headers = ['RAN', 'Importador', 'NIT', 'No. Autorización', 'Subpartida', 'Radionúclido', 'Cantidad', 'Actividad', 'Proveedor'];
      let csvContent = '\uFEFF' + headers.join(';') + '\n';

      data.forEach((row: any) => {
        const fila = [
          `"${row.NumeroSolicitud || ''}"`,
          `"${row.Importador || ''}"`,
          `"${row.Nit || ''}"`,
          `"${row.NumeroAutorizacion || ''}"`,
          `"${row.SubpartidaArancelaria || ''}"`,
          `"${row.Radionuclido || ''}"`,
          `"${row.Cantidad || ''}"`,
          `"${row.Actividad || ''}"`,
          `"${row.NombreProveedor || ''}"`
        ];
        csvContent += fila.join(';') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Resumen_Solicitudes_VUCE_${new Date().toISOString().substring(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      this.showToast('success', 'Éxito', 'Resumen exportado correctamente');
    });
  }

  onCreate() {
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    
    if (file) {
      // Validar que sea un archivo Excel
      const extensionesPermitidas = ['.xlsx', '.xls'];
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!extensionesPermitidas.includes(extension)) {
        this.showToast('error', 'Error', 'Por favor seleccione un archivo Excel válido (.xlsx o .xls)');
        this.limpiarArchivo();
        return;
      }
      
      this.archivoSeleccionado = file;
      this.nombreArchivo = file.name;
      this.respuesta = null;
      this.tieneErrores = false;
      
      // Cargar automáticamente el archivo
      this.cargarArchivo();
      
      // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
      event.target.value = '';
    }
  }

  download(){
    const link = document.createElement('a');
    link.href = 'assets/formatos/Formato_Solicitudes.xlsx';
    link.download = 'Formato_Solicitudes.xlsx';
    link.click();
  }

  limpiarArchivo(): void {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.respuesta = null;
    this.tieneErrores = false;
    
    // Limpiar el input file
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  convertirArchivoABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          const base64 = base64String.includes(',') ? base64String.split(',')[1] : base64String;
          resolve(base64);
        };
        reader.onerror = (error) => {
          console.error('[FRONTEND ERROR] Error leyendo archivo Excel:', error);
          reject(error);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('[FRONTEND ERROR] Excepción al convertir archivo:', err);
        reject(err);
      }
    });
  }

  async cargarArchivo(): Promise<void> {
    if (!this.archivoSeleccionado) {
      this.showToast('warning', 'Advertencia', 'Por favor seleccione un archivo');
      return;
    }

    try {
      this.cargando = true;
      this.respuesta = null;
      this.tieneErrores = false;

      // Convertir archivo a base64
      const fileBase64 = await this.convertirArchivoABase64(this.archivoSeleccionado);

      // Enviar al endpoint
      this.registroService
        .post('carga_rais', { fileBase64 })
        .subscribe(
          (resp: any) => {
            this.cargando = false;
            this.respuesta = resp;
            
            const tieneErroresValidacion = resp.validationErrors && resp.validationErrors.length > 0;
            const tieneErroresInsercion = resp.insertErrors && resp.insertErrors.length > 0;
            
            this.tieneErrores = tieneErroresValidacion || tieneErroresInsercion;
            
            if (!this.tieneErrores) {
              this.showToast('success', 'Éxito', resp.message || 'Archivo procesado correctamente');
              this.limpiarArchivo();
              // [2026-08-06] ADD: Refrescar automáticamente la grilla de solicitudes VUCE tras un cargue exitoso - Johan Piñeres
              this.loadData();
            } else if (tieneErroresValidacion) {
              this.showToast('error', 'Errores de Validación', 
                `Se encontraron ${resp.validationErrors.length} error(es) de validación. No se insertó ningún registro.`);
              // Limpiar solo el archivo seleccionado pero mantener el nombre para referencia
              this.archivoSeleccionado = null;
            } else if (tieneErroresInsercion) {
              this.showToast('warning', 'Errores de Inserción', 
                `Se insertaron ${resp.inserted} registro(s) con ${resp.insertErrors.length} error(es) de inserción.`);
              // Limpiar solo el archivo seleccionado pero mantener el nombre para referencia
              this.archivoSeleccionado = null;
            }
          },
          (err) => {
            this.cargando = false;
            this.respuesta = {
              error: (err.error && err.error.error) || 'Error al procesar el archivo',
              detail: (err.error && err.error.detail) || err.message,
              missingColumns: err.error && err.error.missingColumns
            };
            this.tieneErrores = true;
            
            this.showToast('error', 'Error', this.respuesta.error);
            // Limpiar el archivo para permitir nueva selección
            this.archivoSeleccionado = null;
          }
        );
        
    } catch (error) {
      this.cargando = false;
      console.error('Error al procesar el archivo:', error);
      this.showToast('error', 'Error', 'Error al leer el archivo');
      // Limpiar el archivo para permitir nueva selección
      this.archivoSeleccionado = null;
    }
  }

  private showToast(type: string, title: string, body: string) {
    const toast: Toast = {
      type: type,
      title: title,
      body: body,
      timeout: 5000,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
  }
}