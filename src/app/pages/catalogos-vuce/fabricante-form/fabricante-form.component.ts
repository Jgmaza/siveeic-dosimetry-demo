// ==============================================================================
// PROYECTO: SIVEEIC
// AUTOR: Johan Piñeres
// CONTACTO: johanpineres@gmail.com
// CELULAR: 3003241133
// FECHA: 2026-08-28
// DESCRIPCIÓN: Controlador TypeScript para modal de creación y edición de Fabricantes (HU-016 Fase 3)
//
// HISTORIAL DE CAMBIOS:
// - 2026-08-28 - CREACIÓN DEL ARCHIVO - Lógica reactiva de formulario modal para Fabricantes (HU-016 Fase 3) - Johan Piñeres
// ==============================================================================
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CatalogosVuceService } from '../../../@core/data/services/catalogos-vuce.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fabricante-form',
  templateUrl: './fabricante-form.component.html',
  styleUrls: ['./fabricante-form.component.scss']
})
export class FabricanteFormComponent implements OnInit {
  @Input() createMode: boolean = true;
  @Input() fabricanteId: number;
  @Input() initialData: any;

  formFabricante: FormGroup;
  guardando: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private catalogosService: CatalogosVuceService
  ) {}

  ngOnInit() {
    this.construirForm();
    if (!this.createMode && this.initialData) {
      this.formFabricante.patchValue({
        descripcion: this.initialData.descripcion
      });
    }
  }

  construirForm() {
    this.formFabricante = this.fb.group({
      descripcion: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  guardar() {
    if (this.formFabricante.invalid) {
      return;
    }

    this.guardando = true;
    const payload = {
      descripcion: this.formFabricante.get('descripcion').value.trim()
    };

    if (this.createMode) {
      this.catalogosService.createFabricante(payload).subscribe(
        (res: any) => {
          this.guardando = false;
          Swal({
            title: '¡Registro Exitoso!',
            text: res.message || 'El fabricante ha sido creado correctamente.',
            type: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.activeModal.close(res.data || true);
        },
        (err) => {
          this.guardando = false;
          const msg = err.error && err.error.message ? err.error.message : 'No fue posible crear el fabricante.';
          Swal({
            title: 'Error de Validación',
            text: msg,
            type: 'error',
            confirmButtonText: 'Entendido'
          });
        }
      );
    } else {
      this.catalogosService.updateFabricante(this.fabricanteId, payload).subscribe(
        (res: any) => {
          this.guardando = false;
          Swal({
            title: '¡Actualización Exitosa!',
            text: res.message || 'El fabricante ha sido actualizado correctamente.',
            type: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.activeModal.close(res.data || true);
        },
        (err) => {
          this.guardando = false;
          const msg = err.error && err.error.message ? err.error.message : 'No fue posible actualizar el fabricante.';
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
