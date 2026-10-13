import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { ParamMap, Router, ActivatedRoute } from '@angular/router';
import { formatNumber } from '@angular/common';
import { EstacionesService } from '../../../@core/data/services/estaciones.service';

@Component({
  selector: 'ngx-conectores-list',
  templateUrl: './conectores-list.component.html',
  styleUrls: ['./conectores-list.component.scss'],
})
export class ConectoresListComponent {

  config: ToasterConfig;
  index = 1;
  rowid: any;
  padreid: any;
  cambiotab: boolean = false;
  user_operador: number;
  settings: any;
  registro_punto: any;
  registro_oper: any;
  registro_est: any;
  punto: any;
  estacion: any;
  operador: any;
  source: LocalDataSource = new LocalDataSource();

  constructor(private translate: TranslateService,
              private registroService: EstacionesService,
              private toasterService: ToasterService,
              private route: ActivatedRoute,
              private router: Router) {
    this.loadParam();            
    this.loadData();
    this.loadDataPuntos();
    this.loadDataEstaciones();
    this.loadDataOper();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  loadParam(): void {
    let param=JSON.stringify(this.route.snapshot.queryParamMap);
    let aux = JSON.parse(param);  
    this.registro_punto=aux.params.C4RG4;
    this.registro_oper=aux.params.OP3R;
    this.registro_est=aux.params.EST4;
  }

  onReturn(): void {
    this.router.navigate(['pages/cargave/list-puntos'], { queryParams: { EST4 : this.registro_est ,  OP3R : this.registro_oper } });
  }

  loadDataPuntos(): void {
    this.registroService.get('puntocarga/'+this.registro_punto).subscribe(res => {
      if (res !== null) {
        const datos = <any>res;
        this.punto = { name: datos[0].Marca.toUpperCase()+'-'+datos[0].Protocolo.toUpperCase() };
      }
    });
  }

  loadDataEstaciones(): void {
    this.registroService.get('estacioncarga/'+this.registro_est).subscribe(res => {
      if (res !== null) {
        const datos = <any>res;
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
      this.registroService.get('conectorcarga/0/'+this.registro_punto).subscribe(res => {
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
        addButtonContent: '<i class="nb-plus" title="Agregar Conector Carga"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit" title="Editar Conector Carga"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash" title="Borrar Conector Carga" ></i>',
        confirmDelete: true,
      },

      actions: {  columnTitle: 'Acciones',
                  add: addaction,
                  delete: delaction,
                  edit: editaction,
                  position: 'left'//'right'
                },
      mode: 'external',
      pager: {perPage: 15 },
      columns: {
        // Id: {
        //   title: this.translate.instant('GLOBAL.conectores.id'),
        //   // type: 'number;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        Cantidad: {
          title: this.translate.instant('GLOBAL.conectores.cantidad'),
          type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },//width: '5%',
        },
        Estandar: {
          title: this.translate.instant('GLOBAL.conectores.tipoestandar'),
          type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },//width: '5%',
        },
        Potencia: {
          title: this.translate.instant('GLOBAL.conectores.potencia'),
          // type: 'html;',
          valuePrepareFunction: (value) => {
            return value;
          },//width: '5%',
        },
        Tarifa: {
          title: this.translate.instant('GLOBAL.conectores.tipotarifa'),
          // type: 'tipo_identificacion;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '5%',
        },  
        Precio: {
          title: this.translate.instant('GLOBAL.conectores.precio'),
          type: 'html',
          valuePrepareFunction: (value) => {
            return '<div align="right">$' + formatNumber(value,'en-US')  + ' </div>';
          },//width: '5%', 
        },
        Estado: {
          title: this.translate.instant('GLOBAL.conectores.estado'),
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
          title: this.translate.instant('GLOBAL.conectores.fecharegistro'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '5%',
        },
      },
    };

  }

  itemselec(event): void {
    // console.log("afssaf");
  }  

  activetab(): void {
    this.cambiotab = !this.cambiotab;
  }

/*
  selectTab(event): void {
    //console.info(event)
    if (event.tabTitle === this.translate.instant('GLOBAL.usuarios.lista')) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }*/

  onChange(event) {
    if (event) {
      this.loadData();
      this.cambiotab = !this.cambiotab;
    }
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
