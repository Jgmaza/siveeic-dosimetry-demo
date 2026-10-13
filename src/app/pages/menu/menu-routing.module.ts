import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuComponent } from './menu.component';
import { GrupoListComponent } from './grupo-list/grupo-list.component';
import { GrupoFormComponent } from './grupo-form/grupo-form.component';
import { EnlaceListComponent } from './enlace-list/enlace-list.component';
import { EnlaceFormComponent } from './enlace-form/enlace-form.component';

const routes: Routes = [{
  path: '',
  component: MenuComponent,
  children: [{
    path: 'list-grupo',
    component: GrupoListComponent,
  }, {
    path: 'crud-grupo',
    component: GrupoFormComponent,
  },{
    path: 'list-enlace',
    component: EnlaceListComponent,
  }, {
    path: 'crud-enlace',
    component: EnlaceFormComponent,
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

export class MenuRoutingModule { }

export const routedComponents = [
  MenuComponent,
  GrupoListComponent,
  GrupoFormComponent,
  EnlaceListComponent,
  EnlaceFormComponent,
];
