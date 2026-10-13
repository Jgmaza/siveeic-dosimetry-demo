// ==============================================================================
// PROYECTO: SIVEEIC
// AUTOR: Johan Piñeres
// CONTACTO: johanpineres@gmail.com
// CELULAR: 3003241133
// FECHA: 2026-08-31
// DESCRIPCIÓN: Módulo Angular para administración de Catálogos VUCE (HU-016)
//
// HISTORIAL DE CAMBIOS:
// - 2026-08-27 - CREACIÓN DEL ARCHIVO - Declaración de componentes y servicios para Catálogos VUCE (HU-016 Fase 1) - Johan Piñeres
// - 2026-08-27 - MODIFICACIÓN: Inclusión de componentes para Modelos o Referencias (HU-016 Fase 2) - Johan Piñeres
// - 2026-08-28 - MODIFICACIÓN: Inclusión de componentes para Fabricantes (HU-016 Fase 3) - Johan Piñeres
// - 2026-08-31 - MODIFICACIÓN: Inclusión de componentes para Países de Compra y Origen (HU-016 Fase 4) - Johan Piñeres
// ==============================================================================
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CatalogosVuceRoutingModule, routedComponents } from './catalogos-vuce-routing.module';
import { RadionuclidoFormComponent } from './radionuclido-form/radionuclido-form.component';
import { ModeloReferenciaFormComponent } from './modelo-referencia-form/modelo-referencia-form.component';
import { FabricanteFormComponent } from './fabricante-form/fabricante-form.component';
import { PaisFormComponent } from './pais-form/pais-form.component';
import { CatalogosVuceService } from '../../@core/data/services/catalogos-vuce.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ThemeModule,
    CatalogosVuceRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    NgbModule,
  ],
  declarations: [
    ...routedComponents,
    RadionuclidoFormComponent,
    ModeloReferenciaFormComponent,
    FabricanteFormComponent,
    PaisFormComponent,
  ],
  providers: [
    CatalogosVuceService,
    ToasterService,
  ],
  entryComponents: [
    RadionuclidoFormComponent,
    ModeloReferenciaFormComponent,
    FabricanteFormComponent,
    PaisFormComponent,
  ],
  exports: [
    RadionuclidoFormComponent,
    ModeloReferenciaFormComponent,
    FabricanteFormComponent,
    PaisFormComponent,
  ]
})
export class CatalogosVuceModule { }



