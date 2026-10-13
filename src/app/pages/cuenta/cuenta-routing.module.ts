import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CuentaComponent } from './cuenta.component';

import { PassFormComponent } from './pass-form/pass-form.component';


const routes: Routes = [{
  path: '',
  component: CuentaComponent,
  children: [{
    path: 'crud-pass',
    component: PassFormComponent,
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

export class CuentaRoutingModule { }

export const routedComponents = [
  CuentaComponent,
  PassFormComponent,
];
