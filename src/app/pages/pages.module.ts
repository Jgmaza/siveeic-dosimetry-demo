import { NgModule } from '@angular/core';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { ThemeModule } from '../@theme/theme.module';
import { SharedModule } from '../shared/shared.module';

const PAGES_COMPONENTS = [
  PagesComponent,
];

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    SharedModule,
  ],
  declarations: [
    ...PAGES_COMPONENTS,
  ],
  providers: [
  ],
})
export class PagesModule {
}
