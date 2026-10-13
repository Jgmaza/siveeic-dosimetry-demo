import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContactoComponent } from './contacto.component';
import { ContactoListComponent } from './contacto-list/contacto-list.component';
import { ContactoFormComponent } from './contacto-form/contacto-form.component';



const routes: Routes = [{
  path: '',
  component: ContactoComponent,
  children: [{
    path: 'list-contacto',
    component: ContactoListComponent,
  }, {
    path: 'crud-contacto',
    component: ContactoFormComponent,
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

export class ContactoRoutingModule { }

export const routedComponents = [
  ContactoComponent,
  ContactoListComponent,
  ContactoFormComponent,
];
