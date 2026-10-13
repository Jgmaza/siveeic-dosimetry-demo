import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EstacionesComponent } from './estaciones.component';
import { OperadorListComponent } from './operador-list/operador-list.component';
import { EstacionesListComponent } from './estaciones-list/estaciones-list.component';
import { PuntosListComponent } from './puntos-list/puntos-list.component';
import { ConectoresListComponent } from './conectores-list/conectores-list.component';

const routes: Routes = [{
  path: '',
  component: EstacionesComponent,
  children: [{
    path: 'list-operadores',
    component: OperadorListComponent,
  },{
    path: 'list-estaciones',
    component: EstacionesListComponent,
  },{
    path: 'list-puntos',
    component: PuntosListComponent,
  },{
    path: 'list-conectores',
    component: ConectoresListComponent,
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

export class EstacionesRoutingModule { }

export const routedComponents = [
  EstacionesComponent,
  EstacionesListComponent,
  OperadorListComponent,
  PuntosListComponent,
  ConectoresListComponent,
];
