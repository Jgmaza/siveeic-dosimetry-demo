import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { DashboardService } from '../../../@core/data/dashboard.service';

import { environment } from './../../../../environments/environment';
import $ from 'jquery';
//const serv = environment.DASHBOARD_DATAMINING_SERVER;
const src="assets/tableros/EDA-Dashboard-main/index.html"

@Component({
  selector: 'ngx-tablero-global',
  templateUrl: './tablero-global.component.html',
  styleUrls: ['./tablero-global.component.scss'],
})

export class TableroGlobalComponent implements OnInit {

  site = '<object data="'+src+'" width="100%" height="700" id="dataContainer" (oncontextmenu)="disableContextMenu()"> </object>';

  @ViewChild('dataContainer') dataContainer: ElementRef;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
   // console.info(serv)
    this.loadData(this.site);
  }

  loadData(data) {
    this.dataContainer.nativeElement.innerHTML = data;
  }

  disableContextMenu() {
      window.frames["dataContainer"].document.oncontextmenu = function(){ return false;};   
    } 
  
}
