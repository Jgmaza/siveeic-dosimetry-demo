import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NbPrimerIngresoComponent } from './primeringreso.component';
import { NbRestaurarComponent } from './restaurar/restaurar.component';
import { NbSolicitarComponent } from './solicitar/solicitar.component';



const routes: Routes = [{
  path: '',
  component: NbPrimerIngresoComponent,
  children: [{
    path: 'restaurar',
    component: NbRestaurarComponent,
  }, {
    path: 'solicitar',
    component: NbSolicitarComponent,
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

export class PrimerIngresoRoutingModule { }

export const routedComponents = [
  NbPrimerIngresoComponent,
  NbRestaurarComponent,
  NbSolicitarComponent,
];
