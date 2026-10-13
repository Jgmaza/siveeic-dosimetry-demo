import { EstacionesRoutingModule, routedComponents } from './estaciones-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { UsuariosService } from '../../@core/data/usuarios.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { ToasterService} from 'angular2-toaster';

@NgModule({
  imports: [
    ThemeModule,
    EstacionesRoutingModule,
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
export class EstacionesModule { }
