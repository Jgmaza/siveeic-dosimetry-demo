import { NgModule } from '@angular/core';

import { NgxEchartsModule } from 'ngx-echarts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartModule } from 'angular2-chartjs';

import { ThemeModule } from '../../@theme/theme.module';
import { DashboardComponent } from './dashboard.component';
import { MapsModule } from '../maps/maps.module';
import { EchartsGeneralComponent } from './echarts/echarts-general/echarts-general.component';
import { EchartsLargesizeComponent } from './echarts/echarts-large-size/echart-largesize.component';

@NgModule({
  imports: [
    ThemeModule,
    NgxEchartsModule,
    NgxChartsModule,
    ChartModule,
    MapsModule,
  ],
  declarations: [
    DashboardComponent,
    EchartsGeneralComponent,
    EchartsLargesizeComponent,
  ],
  providers: [
  ],
  exports: [EchartsGeneralComponent, EchartsLargesizeComponent],
})
export class DashboardModule { }
