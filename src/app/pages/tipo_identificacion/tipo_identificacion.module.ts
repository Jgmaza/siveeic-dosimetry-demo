import { TipoIdentificacionRoutingModule, routedComponents } from './tipo_identificacion-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { UsuariosService } from '../../@core/data/usuarios.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudTipoIdentificacionComponent } from './crud-tipo_identificacion/crud-tipo_identificacion.component';
import { ToasterService} from 'angular2-toaster';

@NgModule({
  imports: [
    ThemeModule,
    TipoIdentificacionRoutingModule,
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
    CrudTipoIdentificacionComponent,
  ],
})
export class TipoIdentificacionModule { }
