import { TipoUsuarioRoutingModule, routedComponents } from './tipo_usuario-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { UsuariosService } from '../../@core/data/usuarios.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { CrudTipoUsuarioComponent } from './crud-tipo_usuario/crud-tipo_usuario.component';
import { ToasterService} from 'angular2-toaster';

@NgModule({
  imports: [
    ThemeModule,
    TipoUsuarioRoutingModule,
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
    CrudTipoUsuarioComponent,
  ],
})
export class TipoUsuarioModule { }
