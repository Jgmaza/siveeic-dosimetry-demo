// ==============================================================================
// PROYECTO: SIVEEIC
// AUTOR: Johan Piñeres
// CONTACTO: johanpineres@gmail.com
// CELULAR: 3003241133
// FECHA: 2026-08-31
// DESCRIPCIÓN: Controlador TypeScript para modal de creación y edición de Países (PaisCompra y PaisOrigen - HU-016 Fase 4)
//
// HISTORIAL DE CAMBIOS:
// - 2026-08-29 - ANÁLISIS Y ESTRUCTURACIÓN - Lógica de validación de formulario para países - Johan Piñeres
// - 2026-08-31 - CREACIÓN DEL ARCHIVO - Lógica reactiva de formulario modal para Países (HU-016 Fase 4) - Johan Piñeres
// ==============================================================================
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CatalogosVuceService, PaisItem } from '../../../@core/data/services/catalogos-vuce.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pais-form',
  templateUrl: './pais-form.component.html',
  styleUrls: ['./pais-form.component.scss']
})
export class PaisFormComponent implements OnInit {
  @Input() createMode: boolean = true;
  @Input() paisId: string;
  @Input() initialData: any;

  formPais: FormGroup;
  guardando: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private catalogosService: CatalogosVuceService
  ) {}

  ngOnInit() {
    this.construirForm();
    if (!this.createMode && this.initialData) {
      this.formPais.patchValue({
        id_var: this.initialData.id || this.initialData.id_var,
        nombre_var: this.initialData.nombre || this.initialData.nombre_var,
        desc_var: this.initialData.descripcion || this.initialData.desc_var,
        id_estado_var: this.initialData.estado !== undefined ? this.initialData.estado : (this.initialData.id_estado_var !== undefined ? this.initialData.id_estado_var : 1)
      });
    }
  }

  construirForm() {
    this.formPais = this.fb.group({
      id_var: ['', [Validators.maxLength(6)]],
      nombre_var: ['', [Validators.required, Validators.maxLength(100)]],
      desc_var: ['', [Validators.maxLength(256)]],
      id_estado_var: [1, [Validators.required]]
    });
  }

  guardar() {
    if (this.formPais.invalid) {
      return;
    }

    this.guardando = true;
    const formVal = this.formPais.value;
    const payload: PaisItem = {
      id_var: formVal.id_var ? formVal.id_var.trim().toUpperCase() : null,
      nombre_var: formVal.nombre_var.trim().toUpperCase(),
      desc_var: formVal.desc_var ? formVal.desc_var.trim() : formVal.nombre_var.trim().toUpperCase(),
      id_estado_var: formVal.id_estado_var
    };

    if (this.createMode) {
      this.catalogosService.createPais(payload).subscribe(
        (res: any) => {
          this.guardando = false;
          Swal({
            title: '¡Registro Exitoso!',
            text: res.message || 'El país ha sido creado correctamente.',
            type: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.activeModal.close(res.data || true);
        },
        (err) => {
          this.guardando = false;
          const msg = err.error && err.error.message ? err.error.message : 'No fue posible crear el país.';
          Swal({
            title: 'Error de Validación',
            text: msg,
            type: 'error',
            confirmButtonText: 'Entendido'
          });
        }
      );
    } else {
      this.catalogosService.updatePais(this.paisId, payload).subscribe(
        (res: any) => {
          this.guardando = false;
          Swal({
            title: '¡Actualización Exitosa!',
            text: res.message || 'El país ha sido actualizado correctamente.',
            type: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.activeModal.close(res.data || true);
        },
        (err) => {
          this.guardando = false;
          const msg = err.error && err.error.message ? err.error.message : 'No fue posible actualizar el país.';
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
