// ==============================================================================
// PROYECTO: SIVEEIC
// AUTOR: Johan Piñeres
// CONTACTO: johanpineres@gmail.com
// CELULAR: 3003241133
// FECHA: 2026-08-31
// DESCRIPCIÓN: Enrutador Angular para módulo de administración de Catálogos VUCE (HU-016)
//
// HISTORIAL DE CAMBIOS:
// - 2026-08-27 - CREACIÓN DEL ARCHIVO - Rutas para Radionúclidos y siguientes fases (HU-016 Fase 1) - Johan Piñeres
// - 2026-08-27 - MODIFICACIÓN: Inclusión de ruta para Modelos o Referencias (HU-016 Fase 2) - Johan Piñeres
// - 2026-08-28 - MODIFICACIÓN: Inclusión de ruta para Fabricantes (HU-016 Fase 3) - Johan Piñeres
// - 2026-08-31 - MODIFICACIÓN: Inclusión de ruta para Países de Compra y Origen (HU-016 Fase 4) - Johan Piñeres
// ==============================================================================
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CatalogosVuceComponent } from './catalogos-vuce.component';
import { RadionuclidoListComponent } from './radionuclido-list/radionuclido-list.component';
import { ModeloReferenciaListComponent } from './modelo-referencia-list/modelo-referencia-list.component';
import { FabricanteListComponent } from './fabricante-list/fabricante-list.component';
import { PaisListComponent } from './pais-list/pais-list.component';

const routes: Routes = [{
  path: '',
  component: CatalogosVuceComponent,
  children: [
    {
      path: 'radionuclidos',
      component: RadionuclidoListComponent,
    },
    {
      path: 'modelos-referencia',
      component: ModeloReferenciaListComponent,
    },
    {
      path: 'fabricantes',
      component: FabricanteListComponent,
    },
    // [2026-08-31] ADD: Ruta para Países (HU-016 Fase 4) - Johan Piñeres
    {
      path: 'paises',
      component: PaisListComponent,
    },
    {
      path: '',
      redirectTo: 'radionuclidos',
      pathMatch: 'full',
    }
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CatalogosVuceRoutingModule { }

export const routedComponents = [
  CatalogosVuceComponent,
  RadionuclidoListComponent,
  ModeloReferenciaListComponent,
  FabricanteListComponent,
  PaisListComponent,
];



