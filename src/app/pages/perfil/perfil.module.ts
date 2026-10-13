import { PerfilRoutingModule, routedComponents } from './perfil-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { PerfilService } from '../../@core/data/services/perfil.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { RolFormComponent } from './rol-form/rol-form.component';
import { PerfilFormComponent } from './perfil-form/perfil-form.component';

import { ToasterService} from 'angular2-toaster';

@NgModule({
  imports: [
    ThemeModule,
    PerfilRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
    
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    PerfilService,
    ToasterService,
  ],
  exports: [
    RolFormComponent,
    PerfilFormComponent,
  ],
})
export class PerfilModule { }
