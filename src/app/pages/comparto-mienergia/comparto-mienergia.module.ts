import { CompartomienergiaRoutingModule, routedComponents } from './comparto-mienergia-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { CompartomienergiaService } from '../../@core/data/services/comparto-mienergia.service';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../../shared/shared.module';

import { CompartomienergiaFormComponent } from './comparto-mienergia-form/comparto-mienergia-form.component';
import { CompartomienergiaUploadComponent } from './comparto-mienergia-upload/comparto-mienergia-upload.component';

import { ToasterService} from 'angular2-toaster';

@NgModule({
  imports: [
    ThemeModule,
    CompartomienergiaRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
    
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    CompartomienergiaService,
    ToasterService,
  ],
  exports: [
    CompartomienergiaFormComponent,
    CompartomienergiaUploadComponent,
  ],
})
export class CompartomienergiaModule { }
