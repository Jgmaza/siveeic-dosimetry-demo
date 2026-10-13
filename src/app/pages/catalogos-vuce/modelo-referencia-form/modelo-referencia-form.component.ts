// ==============================================================================
// PROYECTO: SIVEEIC
// AUTOR: Johan Piñeres
// CONTACTO: johanpineres@gmail.com
// CELULAR: 3003241133
// FECHA: 2026-08-27
// DESCRIPCIÓN: Controlador TypeScript para modal de creación y edición de Modelos o Referencias (HU-016 Fase 2)
//
// HISTORIAL DE CAMBIOS:
// - 2026-08-27 - CREACIÓN DEL ARCHIVO - Lógica reactiva de formulario modal para Modelos o Referencias (HU-016 Fase 2) - Johan Piñeres
// ==============================================================================
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CatalogosVuceService } from '../../../@core/data/services/catalogos-vuce.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modelo-referencia-form',
  templateUrl: './modelo-referencia-form.component.html',
  styleUrls: ['./modelo-referencia-form.component.scss']
})
export class ModeloReferenciaFormComponent implements OnInit {
  @Input() createMode: boolean = true;
  @Input() modeloId: number;
  @Input() initialData: any;

  formModelo: FormGroup;
  guardando: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private catalogosService: CatalogosVuceService
  ) {}

  ngOnInit() {
    this.construirForm();
    if (!this.createMode && this.initialData) {
      this.formModelo.patchValue({
        descripcion: this.initialData.descripcion
      });
    }
  }

  construirForm() {
    this.formModelo = this.fb.group({
      descripcion: ['', [Validators.required, Validators.maxLength(40)]]
    });
  }

  guardar() {
    if (this.formModelo.invalid) {
      return;
    }

    this.guardando = true;
    const payload = {
      descripcion: this.formModelo.get('descripcion').value.trim()
    };

    if (this.createMode) {
      this.catalogosService.createModeloReferencia(payload).subscribe(
        (res: any) => {
          this.guardando = false;
          Swal({
            title: '¡Registro Exitoso!',
            text: res.message || 'El modelo o referencia ha sido creado correctamente.',
            type: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.activeModal.close(res.data || true);
        },
        (err) => {
          this.guardando = false;
          const msg = err.error && err.error.message ? err.error.message : 'No fue posible crear el modelo o referencia.';
          Swal({
            title: 'Error de Validación',
            text: msg,
            type: 'error',
            confirmButtonText: 'Entendido'
          });
        }
      );
    } else {
      this.catalogosService.updateModeloReferencia(this.modeloId, payload).subscribe(
        (res: any) => {
          this.guardando = false;
          Swal({
            title: '¡Actualización Exitosa!',
            text: res.message || 'El modelo o referencia ha sido actualizado correctamente.',
            type: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.activeModal.close(res.data || true);
        },
        (err) => {
          this.guardando = false;
          const msg = err.error && err.error.message ? err.error.message : 'No fue posible actualizar el modelo o referencia.';
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
