import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OperadorComponent } from './operador.component';
import { OperadorListComponent } from './operador-list/operador-list.component';
import { OperadorFormComponent } from './operador-form/operador-form.component';

import { ConsentimientoFormComponent } from './../consentimiento-form/consentimiento-form.component';

const routes: Routes = [{
  path: '',
  component: OperadorComponent,
  children: [{
    path: 'list-operador',
    component: OperadorListComponent,
  }, {
    path: 'crud-operador',
    component: OperadorFormComponent,
  },{
    path: 'consentimiento',
    component: ConsentimientoFormComponent,
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

export class OperadorRoutingModule { }

export const routedComponents = [
  OperadorComponent,
  OperadorListComponent,
  OperadorFormComponent,
  ConsentimientoFormComponent,
];
