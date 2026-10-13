import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import * as moment from 'moment';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';

import { ParamMap, Router, ActivatedRoute } from '@angular/router';
import { formatNumber } from '@angular/common';
import { EstacionesView } from '../../../@core/data/models/estaciones/estaciones_view';
import { EstacionesService } from '../../../@core/data/services/estaciones.service';

@Component({
  selector: 'ngx-puntos-list',
  templateUrl: './puntos-list.component.html',
  styleUrls: ['./puntos-list.component.scss'],
})
export class PuntosListComponent {

  config: ToasterConfig;
  index = 1;
  rowid: any;
  padreid: any;
  cambiotab: boolean = false;
  duplicatab: boolean = false;
  user_operador: number;
  settings: any;
  registro_est: any;
  registro_oper: any;
  estacion: any;
  operador: any;
  source: LocalDataSource = new LocalDataSource();

  constructor(private translate: TranslateService,
              private registroService: EstacionesService,
              private toasterService: ToasterService,
              private route: ActivatedRoute,
              private router: Router) {

    this.loadParam();            
    this.loadDataEstaciones();
    this.loadData();
    this.loadDataOper();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  loadParam(): void {
    let param=JSON.stringify(this.route.snapshot.queryParamMap);
    let aux = JSON.parse(param);  
    this.registro_est=aux.params.EST4;
    this.registro_oper=aux.params.OP3R;
  }

  loadDataEstaciones(): void {
    this.registroService.get('estacioncarga/'+this.registro_est).subscribe(res => {
      if (res !== null) {
        const datos = <EstacionesView>res;
        this.estacion = { name: datos[0].Nombre.toUpperCase() };
      }
    });
  }

  loadDataOper(): void {
    this.registroService.get('operador/'+this.registro_oper).subscribe(res => {
      if (res !== null) {
          const datos = <any>res;
          this.operador = { name: datos[0].Nombres.toUpperCase() };
      }
    });
  }  

  loadData(): void {
      this.registroService.get('puntocarga/0/'+this.registro_est).subscribe(res => {
        if (res !== null) {
          const data = <Array<any>>res;
          this.source.load(data);
        }
      });
  }

  cargarCampos() {

    let addaction=false;
    let editaction=false;
    let delaction=false;
    /*
    if(this.user_operador !==0)
      { addaction=false;
        delaction=false;
      }
      */

    this.settings = {
      add: {
        addButtonContent: '<i class="nb-plus" title="Agregar Cargador"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit" title="Editar Cargador"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash" title="Borrar Cargador" ></i>',
        confirmDelete: true,
      },

      actions: {
        columnTitle: 'Acciones',
        add: addaction,
        delete: delaction,
        edit: editaction,
        custom: [
          {
            name: 'conectorAction',
            title: '<i class="nb-keypad" title="Gestionar Conectores" ></i>',
            position: 'right',
          },
          ]
      },     
      mode: 'external',
      pager: {perPage: 15 },
      columns: {
          Cantidad: {
            title: this.translate.instant('GLOBAL.puntos.cantidad'),
            type: 'html',
            valuePrepareFunction: (value) => {
              return '<div align="center"> ' + value + ' </div>';
            },//width: '5%',
          },
          Marca: {
            title: this.translate.instant('GLOBAL.puntos.marca'),
            type: 'html',
            valuePrepareFunction: (value) => {
              return '<div align="left"> ' + value + ' </div>';
            },//width: '5%',
          },/*
          Potencia: {
            title: this.translate.instant('GLOBAL.puntos.potencia'),
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },//width: '5%',
          },*/
          Protocolo: {
            title: this.translate.instant('GLOBAL.puntos.protocolo'),
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },//width: '5%',
          },
          CantConectores: {
            title: this.translate.instant('GLOBAL.puntos.cantconectores'),
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },//width: '5%',
          },
          Estado: {
            title: this.translate.instant('GLOBAL.puntos.estado'),
            // type: 'tipo_estado;',
            valuePrepareFunction: (value) => {
              return value.NombreEstado ? value.NombreEstado : '';
            },
            filterFunction: (cell?: any, search?: string): boolean => {
              return (((cell.NombreEstado + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
            },
            width: '5%',
          },
          Fechacreacion: {
            title: this.translate.instant('GLOBAL.puntos.fecharegistro'),
            // type: 'number;',
            valuePrepareFunction: (value) => {
              return value;
            },
            width: '5%',
          },/*
          Fecharegistro2: {
            title: this.translate.instant('GLOBAL.puntos.fecharegistro'),
            // type: 'Date;',
            valuePrepareFunction: (value) => {
              return moment(value).format('YYYY/MM/DD');
            },
          },*/
        },
    };

  }

  itemselec(event): void {
    
  }  

  activetab(): void {
    this.cambiotab = !this.cambiotab;
  }

  /*
  selectTab(event): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.usuarios.lista')) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }*/

  onReturn(): void {
    this.router.navigate(['/pages/cargave/list-estaciones'], { queryParams: { OP3R : this.registro_oper } });
  }

  onChange(event) {
    if (event) {
      this.loadData();
      this.cambiotab = !this.cambiotab;
    }
  }  
  

  onCustomAction(event): void {
    //alert(`Custom event '${event.action}' fired on row №: ${event.data.Id}`);
    switch(event.action) { 
          case 'conectorAction': { 
            this.onConector(event)
            break; 
          } 
          default: { 
            //statements; 
            break; 
          } 
      } 
  } 


  onConector(event): void {
    this.rowid = event.data.Id;
    this.router.navigate(['pages/cargave/list-conectores'], { queryParams: { C4RG4 : this.rowid, OP3R:this.registro_oper, EST4:this.registro_est } });
  }


    private showToast(type: string, title: string, body: string) {
      this.config = new ToasterConfig({
        // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
        positionClass: 'toast-top-center',
        timeout: 15000,  // ms
        newestOnTop: true,
        tapToDismiss: false, // hide on click
        preventDuplicates: true,
        animation: 'slideDown', // 'fade', 'flyLeft', 'flyRight', 'slideDown', 'slideUp'
        limit: 5,
      });
      const toast: Toast = {
        type: type, // 'default', 'info', 'success', 'warning', 'error'
        title: title,
        body: body,
        showCloseButton: true,
        bodyOutputType: BodyOutputType.TrustedHtml,
      };
      this.toasterService.popAsync(toast);
    }   


}
