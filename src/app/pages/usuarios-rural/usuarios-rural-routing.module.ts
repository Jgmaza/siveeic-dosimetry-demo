import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsuariosruralComponent } from './usuarios-rural.component';
import { UsuariosruralListComponent } from './usuarios-rural-list/usuarios-rural-list.component';
import { UsuariosruralFormComponent } from './usuarios-rural-form/usuarios-rural-form.component';
import { UsuariosruralUploadComponent } from './usuarios-rural-upload/usuarios-rural-upload.component';

const routes: Routes = [{
  path: '',
  component: UsuariosruralComponent,
  children: [{
    path: 'list-usuarios-rural',
    component: UsuariosruralListComponent,
  }, {
    path: 'crud-usuarios-rural',
    component: UsuariosruralFormComponent,
  }, {
    path: 'upload-usuarios-rural',
    component: UsuariosruralUploadComponent,
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

export class UsuariosruralRoutingModule { }

export const routedComponents = [
  UsuariosruralComponent,
  UsuariosruralListComponent,
  UsuariosruralFormComponent,
  UsuariosruralUploadComponent,
];
