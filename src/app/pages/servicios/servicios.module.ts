import { ServiciosRoutingModule, routedComponents } from './servicios-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { TableroedaService } from '../../@core/data/services/tableroseda.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';

import { TableroedaFormComponent } from './tableroseda-form/tableroseda-form.component';
import { VersionedaFormComponent } from './versioneseda-form/versioneseda-form.component';
import { ServiciowebFormComponent } from './serviciosweb-form/serviciosweb-form.component';
import { ApireporteFormComponent } from './apireportes-form/apireportes-form.component';
import { ToasterService} from 'angular2-toaster';

@NgModule({
  imports: [
    ThemeModule,
    ServiciosRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
    
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    TableroedaService,
    ToasterService,
  ],
  exports: [
    TableroedaFormComponent,
    ServiciowebFormComponent,
    VersionedaFormComponent,
    ApireporteFormComponent,
  ],
})
export class ServiciosModule { }
