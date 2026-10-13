import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportesOperativosComponent } from './reportes-operativos.component';

import { RendimientoDiaComponent } from './rendimiento-dia/rendimiento-dia.component';
import { RendimientoConsolidadoComponent } from './rendimiento-consolidado/rendimiento-consolidado.component';


const routes: Routes = [{
  path: '',
  component: ReportesOperativosComponent,
  children: [{
    path: 'rendimiento_consolidado',
    component: RendimientoConsolidadoComponent,
  },{
    path: 'rendimiento_dia',
    component: RendimientoDiaComponent,
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

export class ReportesOperativosRoutingModule { }

export const routedComponents = [
  ReportesOperativosComponent,
  RendimientoConsolidadoComponent,
  RendimientoDiaComponent,

];
