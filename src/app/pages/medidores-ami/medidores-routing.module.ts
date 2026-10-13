import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MedidoresComponent } from './medidores.component';
import { MedidoresListComponent } from './medidores-list/medidores-list.component';
import { MedidoresFormComponent } from './medidores-form/medidores-form.component';
import { MedidoresUploadComponent } from './medidores-upload/medidores-upload.component';

const routes: Routes = [{
  path: '',
  component: MedidoresComponent,
  children: [{
    path: 'list-medidores',
    component: MedidoresListComponent,
  }, {
    path: 'crud-medidores',
    component: MedidoresFormComponent,
  }, {
    path: 'uploadmedidores',
    component: MedidoresUploadComponent,
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

export class MedidoresRoutingModule { }

export const routedComponents = [
  MedidoresComponent,
  MedidoresListComponent,
  MedidoresFormComponent,
  MedidoresUploadComponent,
];
