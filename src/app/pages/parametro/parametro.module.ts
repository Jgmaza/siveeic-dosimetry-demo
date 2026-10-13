import { ParametroRoutingModule, routedComponents } from './parametro-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { ParametroService } from '../../@core/data/services/parametro.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';

import { ParametroFormComponent } from './parametro-form/parametro-form.component';

import { ToasterService} from 'angular2-toaster';

@NgModule({
  imports: [
    ThemeModule,
    ParametroRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
    
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    ParametroService,
    ToasterService,
  ],
  exports: [
    ParametroFormComponent,
  ],
})
export class ParametroModule { }
