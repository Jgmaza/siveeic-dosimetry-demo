// ==============================================================================
// PROYECTO: SIVEEIC
// AUTOR: Johan Piñeres
// CONTACTO: johanpineres@gmail.com
// CELULAR: 3003241133
// FECHA: 2026-08-27
// DESCRIPCIÓN: Controlador TypeScript para modal de creación y edición de Radionúclidos (HU-016 Fase 1)
//
// HISTORIAL DE CAMBIOS:
// - 2026-08-27 - CREACIÓN DEL ARCHIVO - Lógica reactiva de formulario modal para Radionúclidos (HU-016 Fase 1) - Johan Piñeres
// ==============================================================================
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CatalogosVuceService, TipoFuenteItem } from '../../../@core/data/services/catalogos-vuce.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-radionuclido-form',
  templateUrl: './radionuclido-form.component.html',
  styleUrls: ['./radionuclido-form.component.scss']
})
export class RadionuclidoFormComponent implements OnInit {
  @Input() createMode: boolean = true;
  @Input() radionuclidoId: number;
  @Input() initialData: any;

  formRadionuclido: FormGroup;
  tiposFuente: TipoFuenteItem[] = [];
  guardando: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private catalogosService: CatalogosVuceService
  ) {}

  ngOnInit() {
    this.construirForm();
    this.cargarTiposFuente();
    if (!this.createMode && this.initialData) {
      this.formRadionuclido.patchValue({
        descripcion: this.initialData.descripcion,
        id_tipo_fuente: this.initialData.id_tipo_fuente
      });
    }
  }

  construirForm() {
    this.formRadionuclido = this.fb.group({
      descripcion: ['', [Validators.required, Validators.maxLength(100)]],
      id_tipo_fuente: [null, [Validators.required]]
    });
  }

  cargarTiposFuente() {
    this.catalogosService.getTiposFuente().subscribe(
      (res: any) => {
        if (res && Array.isArray(res)) {
          this.tiposFuente = res;
        } else if (res && res.data) {
          this.tiposFuente = res.data;
        }
      },
      (err) => {
        console.error('Error al cargar tipos de fuente:', err);
      }
    );
  }

  guardar() {
    if (this.formRadionuclido.invalid) {
      return;
    }

    this.guardando = true;
    const payload = {
      descripcion: this.formRadionuclido.get('descripcion').value.trim(),
      id_tipo_fuente: this.formRadionuclido.get('id_tipo_fuente').value
    };

    if (this.createMode) {
      this.catalogosService.createRadionuclido(payload).subscribe(
        (res: any) => {
          this.guardando = false;
          Swal({
            title: '¡Registro Exitoso!',
            text: res.message || 'El radionúclido ha sido creado correctamente.',
            type: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.activeModal.close(res.data || true);
        },
        (err) => {
          this.guardando = false;
          const msg = err.error && err.error.message ? err.error.message : 'No fue posible crear el radionúclido.';
          Swal({
            title: 'Error de Validación',
            text: msg,
            type: 'error',
            confirmButtonText: 'Entendido'
          });
        }
      );
    } else {
      this.catalogosService.updateRadionuclido(this.radionuclidoId, payload).subscribe(
        (res: any) => {
          this.guardando = false;
          Swal({
            title: '¡Actualización Exitosa!',
            text: res.message || 'El radionúclido ha sido actualizado correctamente.',
            type: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.activeModal.close(res.data || true);
        },
        (err) => {
          this.guardando = false;
          const msg = err.error && err.error.message ? err.error.message : 'No fue posible actualizar el radionúclido.';
          Swal({
            title: 'Error de Validación',
            text: msg,
            type: 'error',
            confirmButtonText: 'Entendido'
          });
        }
      );
    }
  }
}
