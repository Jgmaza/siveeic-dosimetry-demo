
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndicadoresComponent } from './indicadores.component';

import { TableroGlobalComponent } from './tablero-global/tablero-global.component';
import { TableroEdaComponent } from './tablero-eda/tablero-eda.component';
import { CoberturaGlobalComponent } from './cobertura-global/cobertura-global.component';
import { RendimientoProgramadoComponent } from './rendimiento-programado/rendimiento-programado.component';


const routes: Routes = [{
  path: '',
  component: IndicadoresComponent,
  children: [{
    path: 'global_dashboard',
    component: TableroGlobalComponent,
  },{
    path: 'eda_dashboard',
    component: TableroEdaComponent,
  }, { 
    path: 'avance_cobertura_global',
    component: CoberturaGlobalComponent,
  }, {
    path: 'rendimiento_programado',
    component: RendimientoProgramadoComponent,
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

export class IndicadoresRoutingModule { }

export const routedComponents = [
  TableroGlobalComponent,
  TableroEdaComponent,
  IndicadoresComponent,
  CoberturaGlobalComponent,
  RendimientoProgramadoComponent,
];
