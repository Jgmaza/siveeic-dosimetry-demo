// ==============================================================================
// PROYECTO: SIVEEIC
// AUTOR: Johan Piñeres
// CONTACTO: johanpineres@gmail.com
// CELULAR: 3003241133
// FECHA: 2026-08-31
// DESCRIPCIÓN: Controlador TypeScript para listado interactivo y acciones CRUD de Países (HU-016 Fase 4)
//
// HISTORIAL DE CAMBIOS:
// - 2026-08-29 - ANÁLISIS Y ESTRUCTURACIÓN - Grilla interactiva y control de estado para países - Johan Piñeres
// - 2026-08-31 - CREACIÓN DEL ARCHIVO - Lógica de listado, filtros, paginación y eliminación/inactivación de Países (HU-016 Fase 4) - Johan Piñeres
// ==============================================================================
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalDataSource } from 'ng2-smart-table';
import { CatalogosVuceService } from '../../../@core/data/services/catalogos-vuce.service';
import { PaisFormComponent } from '../pais-form/pais-form.component';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'app-pais-list',
  templateUrl: './pais-list.component.html',
  styleUrls: ['./pais-list.component.scss']
})
export class PaisListComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  source: LocalDataSource = new LocalDataSource();

  searchQuery: string = '';
  selectedEstado: number = null;
  pageSize: number = 25;

  constructor(
    private modalService: NgbModal,
    private catalogosService: CatalogosVuceService,
    private toasterService: ToasterService
  ) {}

  ngOnInit() {
    this.configurarGrilla();
    this.loadData();
  }

  configurarGrilla() {
    this.settings = {
      mode: 'external',
      actions: {
        add: false,
        edit: true,
        delete: true,
        position: 'right'
      },
      edit: {
        editButtonContent: '<i class="nb-edit text-primary font-weight-bold" title="Editar"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash text-danger font-weight-bold" title="Eliminar / Inactivar"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      pager: {
        display: true,
        perPage: this.pageSize
      },
      columns: {
        id: {
          title: 'Código',
          type: 'string',
          width: '100px'
        },
        nombre: {
          title: 'Nombre del País',
          type: 'string'
        },
        descripcion: {
          title: 'Nombre Oficial / Descripción',
          type: 'string'
        },
        estado_desc: {
          title: 'Estado',
          type: 'html',
          width: '120px',
          valuePrepareFunction: (cell, row) => {
            if (row.estado === 1 || row.estado_desc === 'Activo') {
              return '<span class="badge badge-success px-2 py-1">Activo</span>';
            } else {
              return '<span class="badge badge-secondary px-2 py-1">Inactivo</span>';
            }
          }
        }
      }
    };
  }

  loadData() {
    const params: any = {};
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      params.search = this.searchQuery.trim();
    }
    if (this.selectedEstado !== null) {
      params.estado = this.selectedEstado;
    }

    this.catalogosService.getPaises(params).subscribe(
      (res: any) => {
        const data = res && res.data ? res.data : (Array.isArray(res) ? res : []);
        this.source.load(data);
      },
      (err) => {
        console.error('Error al cargar países:', err);
        this.showToast('error', 'Error', 'No fue posible cargar el catálogo de países.');
      }
    );
  }

  onPageSizeChange(size: number) {
    this.pageSize = Number(size);
    this.source.setPaging(1, this.pageSize);
  }

  limpiarFiltros() {
    this.searchQuery = '';
    this.selectedEstado = null;
    this.loadData();
  }

  onCreate() {
    const modalRef = this.modalService.open(PaisFormComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.createMode = true;
    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadData();
        }
      },
      () => {}
    );
  }

  onEdit(event: any) {
    const row = event.data;
    const modalRef = this.modalService.open(PaisFormComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.createMode = false;
    modalRef.componentInstance.paisId = row.id || row.id_var;
    modalRef.componentInstance.initialData = row;
    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadData();
        }
      },
      () => {}
    );
  }

  onDelete(event: any) {
    const row = event.data;
    Swal({
      title: '¿Confirmar Acción?',
      text: `¿Desea eliminar o inactivar el país '${row.nombre}' (Código: ${row.id})? Si tiene registros vinculados será inactivado automáticamente para preservar el histórico.`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.catalogosService.deletePais(row.id).subscribe(
          (res: any) => {
            Swal({
              title: res.action === 'inactivated' ? '¡Inactivado!' : '¡Eliminado!',
              text: res.message || 'La operación se ejecutó correctamente.',
              type: 'success'
            });
            this.loadData();
          },
          (err) => {
            const msg = err.error && err.error.message ? err.error.message : 'No fue posible completar la operación.';
            Swal({
              title: 'Error',
              text: msg,
              type: 'error',
              confirmButtonText: 'Entendido'
            });
          }
        );
      }
    });
  }

  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      positionClass: 'toast-top-center',
      timeout: 10000,
      newestOnTop: true,
      tapToDismiss: true,
      animation: 'slideDown'
    });
    const toast: Toast = {
      type: type,
      title: title,
      body: body,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml
    };
    this.toasterService.popAsync(toast);
  }
}
