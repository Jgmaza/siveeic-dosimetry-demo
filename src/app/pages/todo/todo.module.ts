import { TodoRoutingModule, routedComponents } from './todo-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { UsuariosService } from '../../@core/data/usuarios.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { TodoFormComponent } from './todo-form/todo-form.component';
import { ToasterService} from 'angular2-toaster';

@NgModule({
  imports: [
    ThemeModule,
    TodoRoutingModule,
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
    TodoFormComponent,
  ],
})
export class TodoModule { }
