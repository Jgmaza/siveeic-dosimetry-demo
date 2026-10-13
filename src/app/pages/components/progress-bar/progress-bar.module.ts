import { NgModule } from '@angular/core';
import {
  NbActionsModule,
  NbAlertModule,
  NbButtonModule,
  NbCalendarKitModule,
  NbCalendarModule,
  NbCalendarRangeModule,
  NbCardModule,
  NbChatModule,
  NbProgressBarModule,
  NbSelectModule,
  NbSpinnerModule,
  NbTabsetModule,
} from '@nebular/theme';
import { RouterModule } from '@angular/router';
import { ThemeModule } from '../../../@theme/theme.module';
import { CommonModule } from '@angular/common'

// components
import {
  InteractiveProgressBarComponent,
} from './interactive-progress-bar/interactive-progress-bar.component';
import { ProgressBarComponent } from './progress-bar.component';

const COMPONENTS = [
  ProgressBarComponent,
  InteractiveProgressBarComponent,
];

const MODULES = [
  NbAlertModule,
  NbActionsModule,
  NbButtonModule,
  NbCalendarModule,
  NbCalendarKitModule,
  NbCalendarRangeModule,
  NbCardModule,
  NbChatModule,
  NbProgressBarModule,
  NbSelectModule,
  NbSpinnerModule,
  NbTabsetModule,
  ThemeModule,
  RouterModule,
];

@NgModule({
  imports: [
    ...MODULES,
    CommonModule
  ],
  declarations: [
    ...COMPONENTS,
    ProgressBarModule.rootComponent
  ],
  exports: [
    ...COMPONENTS,
    ProgressBarModule.rootComponent
  ],
  entryComponents: [ProgressBarModule.rootComponent]
})
export class ProgressBarModule { 
  static rootComponent = InteractiveProgressBarComponent}
