import { OperadorRoutingModule, routedComponents } from './operador-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { UsuariosService } from '../../@core/data/usuarios.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { OperadorFormComponent } from './operador-form/operador-form.component';
import { ToasterService} from 'angular2-toaster';
import { ConsentimientoFormComponent } from './../consentimiento-form/consentimiento-form.component';
@NgModule({
  imports: [
    ThemeModule,
    OperadorRoutingModule,
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
    OperadorFormComponent,
    ConsentimientoFormComponent,
  ],
})
export class OperadorModule { }
