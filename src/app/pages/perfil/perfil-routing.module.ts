import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PerfilComponent } from './perfil.component';
import { RolListComponent } from './rol-list/rol-list.component';
import { RolFormComponent } from './rol-form/rol-form.component';
import { PerfilListComponent } from './perfil-list/perfil-list.component';
import { PerfilFormComponent } from './perfil-form/perfil-form.component';

const routes: Routes = [{
  path: '',
  component: PerfilComponent,
  children: [{
    path: 'list-rol',
    component: RolListComponent,
  }, {
    path: 'crud-rol',
    component: RolFormComponent,
  },{
    path: 'list-perfil',
    component: PerfilListComponent,
  }, {
    path: 'crud-perfil',
    component: PerfilFormComponent,
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

export class PerfilRoutingModule { }

export const routedComponents = [
  PerfilComponent,
  RolListComponent,
  RolFormComponent,
  PerfilListComponent,
  PerfilFormComponent,
];
