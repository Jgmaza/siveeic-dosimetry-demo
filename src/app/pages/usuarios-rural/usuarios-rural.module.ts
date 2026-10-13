import { UsuariosruralRoutingModule, routedComponents } from './usuarios-rural-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { UsuariosruralService } from '../../@core/data/services/usuarios-rural.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';

import { UsuariosruralFormComponent } from './usuarios-rural-form/usuarios-rural-form.component';
import { UsuariosruralUploadComponent } from './usuarios-rural-upload/usuarios-rural-upload.component';

import { ToasterService} from 'angular2-toaster';

@NgModule({
  imports: [
    ThemeModule,
    UsuariosruralRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
    
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    UsuariosruralService,
    ToasterService,
  ],
  exports: [
    UsuariosruralFormComponent,
    UsuariosruralUploadComponent,
  ],
})
export class UsuariosruralModule { }
