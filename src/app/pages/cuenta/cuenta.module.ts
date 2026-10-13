import { CuentaRoutingModule, routedComponents } from './cuenta-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { ToasterService} from 'angular2-toaster';

import { UsuariosService } from '../../@core/data/usuarios.service';

@NgModule({
  imports: [
    ThemeModule,
    CuentaRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
    
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    UsuariosService,
    ToasterService,
  ],
  exports: [
  ],
})
export class CuentaModule { }
