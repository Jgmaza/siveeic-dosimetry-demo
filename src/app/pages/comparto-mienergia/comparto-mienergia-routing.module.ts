import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompartomienergiaComponent } from './comparto-mienergia.component';
import { CompartomienergiaListComponent } from './comparto-mienergia-list/comparto-mienergia-list.component';
import { CompartomienergiaFormComponent } from './comparto-mienergia-form/comparto-mienergia-form.component';
import { CompartomienergiaUploadComponent } from './comparto-mienergia-upload/comparto-mienergia-upload.component';

const routes: Routes = [{
  path: '',
  component: CompartomienergiaComponent,
  children: [{
    path: 'list-comparto-mienergia',
    component: CompartomienergiaListComponent,
  }, {
    path: 'crud-comparto-mienergia',
    component: CompartomienergiaFormComponent,
  }, {
    path: 'upload-comparto-mienergia',
    component: CompartomienergiaUploadComponent,
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

export class CompartomienergiaRoutingModule { }

export const routedComponents = [
  CompartomienergiaComponent,
  CompartomienergiaListComponent,
  CompartomienergiaFormComponent,
  CompartomienergiaUploadComponent,
];
