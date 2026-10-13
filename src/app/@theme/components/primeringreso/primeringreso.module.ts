import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThemeModule } from '../../theme.module';
import { NbPrimerIngresoComponent } from './primeringreso.component';
import { NbRestaurarComponent } from './restaurar/restaurar.component';
import { NbSolicitarComponent } from './solicitar/solicitar.component';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  imports: [
    CommonModule,
    ThemeModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  declarations: [
    NbPrimerIngresoComponent,
    NbRestaurarComponent,
    NbSolicitarComponent,
  ],
  providers: [
  ],
  exports: [
    NbPrimerIngresoComponent,
    NbRestaurarComponent,
    NbSolicitarComponent,
  ],
})
export class NbPrimerIngresoModule {
}
