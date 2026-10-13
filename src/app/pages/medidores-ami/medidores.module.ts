import { MedidoresRoutingModule, routedComponents } from './medidores-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { MedidoresService } from '../../@core/data/services/medidores-ami.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';
import { MedidoresFormComponent } from './medidores-form/medidores-form.component';
import { MedidoresUploadComponent } from './medidores-upload/medidores-upload.component';

import { ToasterService} from 'angular2-toaster';

@NgModule({
  imports: [
    ThemeModule,
    MedidoresRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
    
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    MedidoresService,
    ToasterService,
  ],
  exports: [
    MedidoresFormComponent,
    MedidoresUploadComponent,
  ],
})
export class MedidoresModule { }
