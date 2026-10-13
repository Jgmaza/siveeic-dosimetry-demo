import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsuarioComponent } from './usuario.component';
import { ListUsuarioComponent } from './list-usuario/list-usuario.component';
import { CrudUsuarioComponent } from './crud-usuario/crud-usuario.component';



const routes: Routes = [{
  path: '',
  component: UsuarioComponent,
  children: [{
    path: 'list-usuario',
    component: ListUsuarioComponent,
  }, {
    path: 'crud-usuario',
    component: CrudUsuarioComponent,
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

export class UsuarioRoutingModule { }

export const routedComponents = [
  UsuarioComponent,
  ListUsuarioComponent,
  CrudUsuarioComponent,
];
