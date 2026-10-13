import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DosimetriaComponent } from './dosimetria.component';
import { DosimetriaListComponent } from './dosimetria-list/dosimetria-list.component';
import { DosimetriaHistoricComponent } from './dosimetria-historic/dosimetria-historic.component';
import { DosimetriaFormComponent } from './dosimetria-form/dosimetria-form.component';
import { DosimetriaUploadComponent } from './dosimetria-upload/dosimetria-upload.component';
import { MincitProcessComponent } from './mincit-process/mincit-process.component';
import { DosimetriaUnificadoComponent } from './dosimetria-unificado/dosimetria-unificado.component';
import { ReportesDosimetriaComponent } from './reportes-dosimetria/reportes-dosimetria.component';

/** Demo: only reportes-dosimetria is routed; other components stay declared for AOT. */
const routes: Routes = [{
  path: '',
  component: DosimetriaComponent,
  children: [{
    path: 'reportes-dosimetria',
    component: ReportesDosimetriaComponent,
  }, {
    path: '',
    redirectTo: 'reportes-dosimetria',
    pathMatch: 'full',
  }, {
    path: '**',
    redirectTo: 'reportes-dosimetria',
  }],
}];

@NgModule({
  imports: [
      RouterModule.forChild(routes),
  ],
  exports: [
      RouterModule,
  ],
})

export class DosimetriaRoutingModule { }

export const routedComponents = [
  DosimetriaComponent,
  DosimetriaListComponent,
  DosimetriaHistoricComponent,
  DosimetriaUnificadoComponent,
  ReportesDosimetriaComponent,
  DosimetriaFormComponent,
  DosimetriaUploadComponent,
  MincitProcessComponent,
];
