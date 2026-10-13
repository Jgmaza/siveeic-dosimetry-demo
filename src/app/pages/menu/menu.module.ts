import { MenuRoutingModule, routedComponents } from './menu-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { EnlaceService } from '../../@core/data/services/enlace.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { GrupoFormComponent } from './grupo-form/grupo-form.component';
import { EnlaceFormComponent } from './enlace-form/enlace-form.component';

import { ToasterService} from 'angular2-toaster';

@NgModule({
  imports: [
    ThemeModule,
    MenuRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
    
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    EnlaceService,
    ToasterService,
  ],
  exports: [
    GrupoFormComponent,
    EnlaceFormComponent,
  ],
})
export class MenuModule { }
