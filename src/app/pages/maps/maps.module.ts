import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgxEchartsModule } from 'ngx-echarts';
import { NbCardModule } from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { MapsRoutingModule, routedComponents } from './maps-routing.module';
import { BubbleMapComponent } from './bubble-map/bubble-map.component';

@NgModule({
  imports: [
    ThemeModule,
    AgmCoreModule.forRoot({
      // Demo portfolio: no Google Maps key (module unused). Never commit real API keys.
      apiKey: '',
      libraries: ['places'],
    }),
    LeafletModule.forRoot(),
    MapsRoutingModule,
    NgxEchartsModule,
    NbCardModule,
  ],
  exports: [BubbleMapComponent],
  declarations: [
    ...routedComponents,
  ],
})
export class MapsModule { }
