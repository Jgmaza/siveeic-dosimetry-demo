import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { DashboardService } from '../../../@core/data/dashboard.service';
import { ParamMap, Router, ActivatedRoute } from '@angular/router';
import { ServiciowebService } from '../../../@core/data/services/servicioweb.service';

import { environment } from '../../../../environments/environment';
import $ from 'jquery';
//const serv = environment.DASHBOARD_DATAMINING_SERVER;
//const src="assets/tableros/EDA-Dashboard-main_AMI/index.html"

@Component({
  selector: 'ngx-tablero-eda',
  templateUrl: './tablero-eda.component.html',
  styleUrls: ['./tablero-eda.component.scss'],
})

export class TableroEdaComponent implements OnInit {
  tablero : any;
  servicio : any;
  user : any;
  site : any;
  
  @ViewChild('dataContainer') dataContainer: ElementRef;

  constructor(private dashboardService: DashboardService,
              private registroService: ServiciowebService,
              private route: ActivatedRoute,
              private router: Router) {
    this.load_UserData();            
    //this.loadApi();            
    //this.loadParam();
  }

  ngOnInit() {
    //this.route.url.subscribe(url => console.log('The URL changed to: ' + url));
    this.route.queryParams.subscribe(params => {//console.log('The URL changed to: ' + params["board"]);
                                                this.loadApi()} );
  }

  load_UserData(): void {
    // rescata el idenlace asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
        this.user = user;
        //console.info(this.user)
    });
  } 

  loadParam(): void {
    let param=JSON.stringify(this.route.snapshot.queryParamMap);
    let aux = JSON.parse(param);  
    this.tablero=aux.params.board;
    //console.info(this.tablero)
  }
  
  loadApi(){
    this.registroService.get('servicioweb/0/tableroeda')
    .subscribe(res => {
      if (res !== null) {
        //rescatar variables de la url
        let param=JSON.stringify(this.route.snapshot.queryParamMap);
        let aux = JSON.parse(param);  
        //this.tablero=aux.params['board']
        this.servicio = res;
        let url= this.servicio[0]['Servidor'];
         //asigna json
         let parametros=JSON.parse(this.servicio[0]['Parametros']);
         //tamaño json
         //let tam=Object.keys(parametros).length;
         url+= parametros['pagina']+"?";
         Object.keys(parametros).forEach(function(key) {
         if(key!='pagina' && parametros[key]['variable']!='')
             { let valor = aux.params[parametros[key]['variable']];
               valor = valor.replace("$"+parametros[key]['variable'],valor);
               url+=  parametros[key]['variable']+"="+valor+"&";
             }
         });
         url+= "p4s3="+this.user['token']
         this.site = '<object data="'+url+'" width="100%" height="1000" id="dataContainer" (oncontextmenu)="disableContextMenu()"> </object>';
         this.loadData(this.site);
      }
    });
  }

  loadData(data) {
    this.dataContainer.nativeElement.innerHTML = data;
  }

  disableContextMenu() {
      window.frames["dataContainer"].document.oncontextmenu = function(){ return false;};   
    } 
}
