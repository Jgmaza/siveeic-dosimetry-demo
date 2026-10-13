import { Component, OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { DashboardService } from '../../@core/data/dashboard.service';


interface CardSettings {
  title: string;
  iconClass: string;
  type: string;
}

@Component({
  selector: 'ngx-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnDestroy {
  data = [{ lat: 12.558288, lng: -81.7201537 }];
  constructor(private themeService: NbThemeService, private dashboardService: DashboardService) {

  }

  ngOnDestroy() {
  }

}
