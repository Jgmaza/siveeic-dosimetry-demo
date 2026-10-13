import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ParametroComponent } from './parametro.component';
import { ParametroListComponent } from './parametro-list/parametro-list.component';
import { ParametroFormComponent } from './parametro-form/parametro-form.component';

const routes: Routes = [{
  path: '',
  component: ParametroComponent,
  children: [{
    path: 'list-parametro',
    component: ParametroListComponent,
  }, {
    path: 'crud-parametro',
    component: ParametroFormComponent,
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

export class ParametroRoutingModule { }

export const routedComponents = [
  ParametroComponent,
  ParametroListComponent,
  ParametroFormComponent,
];
