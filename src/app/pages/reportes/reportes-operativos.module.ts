import { ReportesOperativosRoutingModule, routedComponents } from './reportes-operativos-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { UsuariosService } from '../../@core/data/usuarios.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { ToasterService } from 'angular2-toaster';
import { MapsModule } from '../maps/maps.module';
import { NgxEchartsModule } from 'ngx-echarts';
import { NbAccordionModule } from '@nebular/theme';

import { DashboardModule } from '../dashboard/dashboard.module';

import { RendimientoConsolidadoComponent } from './rendimiento-consolidado/rendimiento-consolidado.component';
import { RendimientoDiaComponent } from './rendimiento-dia/rendimiento-dia.component';



@NgModule({
  imports: [
    NgxEchartsModule,
    ThemeModule,
    ReportesOperativosRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
    MapsModule,
    NbAccordionModule,
    DashboardModule,
  ],
  declarations: [
    ...routedComponents,
    RendimientoConsolidadoComponent,
    RendimientoDiaComponent,
  ],
  providers: [
    UsuariosService,
    ToasterService,
  ],
  exports: [

  ],
})
export class ReportesOperativosModule { }
