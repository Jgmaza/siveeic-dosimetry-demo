import { IndicadoresRoutingModule, routedComponents } from './indicadores-routing.module';
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

import { TableroGlobalComponent } from './tablero-global/tablero-global.component';
import { TableroEdaComponent } from './tablero-eda/tablero-eda.component';

import { RendimientoProgramadoComponent } from './rendimiento-programado/rendimiento-programado.component';
import { CoberturaGlobalComponent } from './cobertura-global/cobertura-global.component';

@NgModule({
  imports: [
    NgxEchartsModule,
    ThemeModule,
    IndicadoresRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
    MapsModule,
    NbAccordionModule,
    DashboardModule,
  ],
  declarations: [
    ...routedComponents,
    TableroGlobalComponent,
    TableroEdaComponent,
    CoberturaGlobalComponent,
    RendimientoProgramadoComponent,
  ],
  providers: [
    UsuariosService,
    ToasterService,
  ],
  exports: [
    TableroGlobalComponent,
    CoberturaGlobalComponent,
  ],
})
export class IndicadoresModule { }
