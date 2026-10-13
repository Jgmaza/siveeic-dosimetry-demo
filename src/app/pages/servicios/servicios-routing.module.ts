import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ServiciosComponent } from './servicios.component';
import { TableroedaListComponent } from './tableroseda-list/tableroseda-list.component';
import { TableroedaFormComponent } from './tableroseda-form/tableroseda-form.component';
import { VersionedaFormComponent } from './versioneseda-form/versioneseda-form.component';
import { ServiciowebListComponent } from './serviciosweb-list/serviciosweb-list.component';
import { ServiciowebFormComponent } from './serviciosweb-form/serviciosweb-form.component';
import { ApireporteListComponent } from './apireportes-list/apireportes-list.component';
import { ApireporteFormComponent } from './apireportes-form/apireportes-form.component';

const routes: Routes = [{
  path: '',
  component: ServiciosComponent,
  children: [{
    path: 'list-tableroseda',
    component: TableroedaListComponent,
  }, {
    path: 'crud-tableroseda',
    component: TableroedaFormComponent,
  }, {
    path: 'crud-versioneseda',
    component: VersionedaFormComponent,
  },{
    path: 'list-serviciosweb',
    component: ServiciowebListComponent,
  }, {
    path: 'crud-serviciosweb',
    component: ServiciowebFormComponent,
  },{
    path: 'list-apireportes',
    component: ApireporteListComponent,
  }, {
    path: 'crud-apireportes',
    component: ApireporteFormComponent,
  },],
}];

@NgModule({
  imports: [
      RouterModule.forChild(routes),
  ],
  exports: [
      RouterModule,
  ],
})

export class ServiciosRoutingModule { }

export const routedComponents = [
  ServiciosComponent,
  TableroedaListComponent,
  TableroedaFormComponent,
  VersionedaFormComponent,
  ServiciowebListComponent,
  ServiciowebFormComponent, 
  ApireporteListComponent,
  ApireporteFormComponent,
];
