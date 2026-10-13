import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TipoUsuarioComponent } from './tipo_usuario.component';
import { ListTipoUsuarioComponent } from './list-tipo_usuario/list-tipo_usuario.component';
import { CrudTipoUsuarioComponent } from './crud-tipo_usuario/crud-tipo_usuario.component';



const routes: Routes = [{
  path: '',
  component: TipoUsuarioComponent,
  children: [{
    path: 'list-tipo_usuario',
    component: ListTipoUsuarioComponent,
  }, {
    path: 'crud-tipo_usuario',
    component: CrudTipoUsuarioComponent,
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

export class TipoUsuarioRoutingModule { }

export const routedComponents = [
  TipoUsuarioComponent,
  ListTipoUsuarioComponent,
  CrudTipoUsuarioComponent,
];
