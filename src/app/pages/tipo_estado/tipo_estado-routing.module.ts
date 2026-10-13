import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TipoEstadoComponent } from './tipo_estado.component';
import { ListTipoEstadoComponent } from './list-tipo_estado/list-tipo_estado.component';
import { CrudTipoEstadoComponent } from './crud-tipo_estado/crud-tipo_estado.component';



const routes: Routes = [{
  path: '',
  component: TipoEstadoComponent,
  children: [{
    path: 'list-tipo_estado',
    component: ListTipoEstadoComponent,
  }, {
    path: 'crud-tipo_estado',
    component: CrudTipoEstadoComponent,
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

export class TipoEstadoRoutingModule { }

export const routedComponents = [
  TipoEstadoComponent,
  ListTipoEstadoComponent,
  CrudTipoEstadoComponent,
];
