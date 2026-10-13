// ==============================================================================
// PROYECTO: SIVEEIC
// AUTOR: Johan Piñeres
// CONTACTO: johanpineres@gmail.com
// CELULAR: 3003241133
// FECHA: 2026-08-28
// DESCRIPCIÓN: Controlador TypeScript para listado interactivo y acciones CRUD de Fabricantes (HU-016 Fase 3)
//
// HISTORIAL DE CAMBIOS:
// - 2026-08-28 - CREACIÓN DEL ARCHIVO - Grilla interactiva, búsqueda, paginación y eliminación con dependencias (HU-016 Fase 3) - Johan Piñeres
// ==============================================================================
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalDataSource } from 'ng2-smart-table';
import { CatalogosVuceService } from '../../../@core/data/services/catalogos-vuce.service';
import { FabricanteFormComponent } from '../fabricante-form/fabricante-form.component';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'app-fabricante-list',
  templateUrl: './fabricante-list.component.html',
  styleUrls: ['./fabricante-list.component.scss']
})
export class FabricanteListComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  source: LocalDataSource = new LocalDataSource();

  searchQuery: string = '';
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
        deleteButtonContent: '<i class="nb-trash text-danger font-weight-bold" title="Eliminar"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      pager: {
        display: true,
        perPage: this.pageSize
      },
      columns: {
        id: {
          title: 'ID',
          type: 'number',
          width: '100px'
        },
        descripcion: {
          title: 'Descripción del Fabricante',
          type: 'string'
        }
      }
    };
  }

  loadData() {
    const params: any = {};
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      params.search = this.searchQuery.trim();
    }

    this.catalogosService.getFabricantes(params).subscribe(
      (res: any) => {
        const data = res && res.data ? res.data : (Array.isArray(res) ? res : []);
        this.source.load(data);
      },
      (err) => {
        console.error('Error al cargar fabricantes:', err);
        this.showToast('error', 'Error', 'No fue posible cargar el catálogo de fabricantes.');
      }
    );
  }

  onPageSizeChange(size: number) {
    this.pageSize = Number(size);
    this.source.setPaging(1, this.pageSize);
  }

  limpiarFiltros() {
    this.searchQuery = '';
    this.loadData();
  }

  onCreate() {
    const modalRef = this.modalService.open(FabricanteFormComponent, { size: 'lg', backdrop: 'static' });
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
    const modalRef = this.modalService.open(FabricanteFormComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.createMode = false;
    modalRef.componentInstance.fabricanteId = row.id;
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
      title: '¿Confirmar Eliminación?',
      text: `¿Está seguro de eliminar el fabricante '${row.descripcion}' (ID: ${row.id})?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.catalogosService.deleteFabricante(row.id).subscribe(
          (res: any) => {
            Swal({
              title: '¡Eliminado!',
              text: res.message || 'El registro ha sido eliminado exitosamente.',
              type: 'success'
            });
            this.loadData();
          },
          (err) => {
            const msg = err.error && err.error.message ? err.error.message : 'No fue posible eliminar el registro.';
            Swal({
              title: 'No se puede eliminar',
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
