import { DosimetriaRoutingModule, routedComponents } from './dosimetria-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { ProgressBarModule } from '../components/progress-bar/progress-bar.module';

import { DosimetriaService } from '../../@core/data/services/dosimetria.service';
import { DosimetriaDetalleModalComponent } from './dosimetria-detalle-modal/dosimetria-detalle-modal.component';
import { CheckboxRenderComponent } from './dosimetria-historic/checkbox-render.component';
import { CheckboxHeaderComponent } from './dosimetria-historic/checkbox-header.component';
import { DosimetriaHistoricoSeleccionService } from './dosimetria-historico-seleccion.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule }     from '@angular/material/select';
import { MatOptionModule }     from '@angular/material/core';

import { ToasterService} from 'angular2-toaster';

@NgModule({
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    ThemeModule,
    DosimetriaRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
    ProgressBarModule,
  ],
  declarations: [
    ...routedComponents,
    CheckboxRenderComponent,
    CheckboxHeaderComponent,
    DosimetriaDetalleModalComponent,
  ],
  providers: [
    DosimetriaService,
    ToasterService,
    DosimetriaHistoricoSeleccionService,
  ],
  entryComponents: [
    CheckboxRenderComponent,
    CheckboxHeaderComponent,
    DosimetriaDetalleModalComponent,
  ],
})
export class DosimetriaModule { }
