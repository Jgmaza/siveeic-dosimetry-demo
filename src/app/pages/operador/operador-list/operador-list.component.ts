import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OperadorFormComponent } from '../operador-form/operador-form.component';
import { ConsentimientoFormComponent } from '../../consentimiento-form/consentimiento-form.component';

//import { OperadorService } from '../services/operador.service';
//import { OperadorViewModel } from '../models/operador-view-model';
import { LocalDataSource } from 'ng2-smart-table';
import { ExcelServicesService } from '../../../@core/data/excel-services.service';
import { OperadorService } from '../../../@core/data/services/operador.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as moment from 'moment';
import { OperadorView } from '../../../@core/data/models/operador/operador_view';

import { ConsentimientoService } from '../../../@core/data/services/consentimiento.service';
import { environment } from '../../../../environments/environment';
const filepath = environment.FILES_SERVICE;

@Component({
  selector: 'app-operador-list',
  templateUrl: './operador-list.component.html',
  styleUrls: ['./operador-list.component.scss']
})
export class OperadorListComponent implements OnInit {

  uid: number;
  user_operador: number;

  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  excel=[];
  source: LocalDataSource = new LocalDataSource();  
  //handleModalOperadorFormClose: any;

  constructor(private modalService: NgbModal, private translate: TranslateService, private registroService: OperadorService,
              private consentimientoService: ConsentimientoService, private toasterService: ToasterService, private excelService:ExcelServicesService) {
    this.load_UserData();
    this.loadData();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
    this.Concentimiento();
  }
    

  cargarCampos() {

    let addaction=true;
    let delaction=true;

    if(this.user_operador !==0)
      { addaction=false;
        delaction=false;
      }

    this.settings = {
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      actions: { add: addaction,
                 delete: delaction },
      mode: 'external',
      columns: {
        // Id: {
        //   title: this.translate.instant('GLOBAL.operador.id'),
        //   // type: 'number;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        Files: {
          title:this.translate.instant('GLOBAL.operador.lagalfile'),
          type: 'html',
          valuePrepareFunction: (value) => {
            let files='';
            files = value.File_legal ? '<div><a href="'+filepath+value.File_legal.folder+'/'+value.File_legal.rename+'"  target="popup" onClick="window.open(this.href, this.target, "width=300,height=400"); return false;" ><img width="30" height="32" src="assets/images/pdf.png" alt="'+value.File_legal.rename+'" /></a> </div>' : '';
            return files;
          },
          //width: '5%',
        }, 
        Tipopersona: {
          title: this.translate.instant('GLOBAL.operador.tipopersona'),
          // type: 'tipo_usuario;',
          valuePrepareFunction: (value) => {
            return value.Nombre ? value.Nombre : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Nombre + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Nombres: {
          title: this.translate.instant('GLOBAL.operador.nombres'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Siglas: {
          title: this.translate.instant('GLOBAL.operador.siglas'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Tipoidentificacion: {
          title: this.translate.instant('GLOBAL.operador.tipoidentificacion'),
          // type: 'tipo_identificacion;',
          valuePrepareFunction: (value) => {
            return value.NombreIdentificacion ? value.NombreIdentificacion : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreIdentificacion + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Nroidentificacion: {
          title: this.translate.instant('GLOBAL.operador.nroidentificacion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Tipooperador: {
          title: this.translate.instant('GLOBAL.operador.tipooperador'),
          // type: 'tipo_operador;',
          valuePrepareFunction: (value) => {
            return value.TipoOperador ? value.TipoOperador : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.TipoOperador + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },

        Departamento: {
          title: this.translate.instant('GLOBAL.operador.departamento'),
          // type: 'tipo_operador;',
          valuePrepareFunction: (value) => {
            return value.NombreDepartamento ? value.NombreDepartamento : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreDepartamento + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },

        Municipio: {
          title: this.translate.instant('GLOBAL.operador.municipio'),
          // type: 'tipo_operador;',
          valuePrepareFunction: (value) => {
            return value.NombreMunicipio ? value.NombreMunicipio : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreMunicipio + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },

        Direccion: {
          title: this.translate.instant('GLOBAL.operador.direccion'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Correo: {
          title: this.translate.instant('GLOBAL.operador.correo'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Sitio: {
          title: this.translate.instant('GLOBAL.operador.sitio'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Indicativo: {
          title: this.translate.instant('GLOBAL.operador.indicativo'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Telefonofijo: {
          title: this.translate.instant('GLOBAL.operador.telefonofijo'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Celular: {
          title: this.translate.instant('GLOBAL.operador.celular'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Estadooperador: {
          title: this.translate.instant('GLOBAL.operador.estadooperador'),
          // type: 'tipo_estado;',
          valuePrepareFunction: (value) => {
            return value.NombreEstado ? value.NombreEstado : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreEstado + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Fechacreacion: {
          title: this.translate.instant('GLOBAL.operador.fechacreacion'),
          // type: 'Date;',
          valuePrepareFunction: (value) => {
            return moment(value).format('YYYY/MM/DD HH:mm:SS');
          },
        },
      },
    };
  }

  load_UserData(): void {
    // rescata el idoperador asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
        //this.uid = user.id;
        this.user_operador = user.operador;
    });
  }

  loadData(): void {
    this.registroService.get('operador/'+this.user_operador).subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        //console.info(data)
        this.source.load(data);
        //PARA EXPORTAR EXCEL
        this.excel=[];
        let arrayText:any;
        data.forEach(row => {
        arrayText = {
            Tipo_persona:row.Tipopersona.Nombre,
            Nombre: row.Nombres,
            Tipo_identificacion:row.Tipoidentificacion.NombreIdentificacion,
            Nro_identificacion:row.Nroidentificacion,
            Tipo_operador:row.Tipooperador.TipoOperador,
            Direccion:  row.Direccion,
            Correo:  row.Correo,
            Indicativo:  row.Indicativo,
            Telefonofijo:row.Telefonofijo, 
            Celular:  row.Celular,
        }    
        this.excel.push(arrayText);
        });
        // console.info(this.excel);
      }
    });
  }


  //funcion para exporta en hoja de calculo
  exportAsXLSX():void {
    this.excelService.exportAsExcelFile(this.excel, 'Empresas_servicios');
  }  

  ngOnInit() {
  }

 registros: OperadorView[] = [];

 Concentimiento(): void {

  if(this.user_operador!==0)
    {
      this.consentimientoService.get('consentimiento/'+this.user_operador)
        .subscribe(res => {
          if (res !== null) {
            let aut = Object.entries(res);
            //console.info(aut.length);
            if (aut.length < 1) {
              const modal = this.modalService.open(ConsentimientoFormComponent,{windowClass:"my-class"});
              modal.result.then((data) => {
                this.loadData(); // on close
              }, (reason) => {
                // on dismiss
                this.handleModalConsentimientoFormClose.bind(this),
                this.handleModalConsentimientoFormClose.bind(this)
              });
            }
          }
        });
      }     


}

 onCreate(event) {
    const modal = this.modalService.open(OperadorFormComponent,{windowClass:"my-class"});
    modal.result.then((data) => {
      this.loadData(); // on close
    }, (reason) => {
      // on dismiss
      this.handleModalOperadorFormClose.bind(this),
      this.handleModalOperadorFormClose.bind(this)
    });
}

handleModalConsentimientoFormClose(response) {
  // is response an object?
  if (response === Object(response)) {
    if (response.createMode) {
      response.registro.id = response.id;
      this.registros.unshift(response.registro);
    } else {
      let index = this.registros.findIndex(value => value.Id == response.id);
      this.registros[index] = response.registro;
    }
  }
}

handleModalOperadorFormClose(response) {
  // is response an object?
  if (response === Object(response)) {
    if (response.createMode) {
      response.registro.id = response.id;
      this.registros.unshift(response.registro);
    } else {
      let index = this.registros.findIndex(value => value.Id == response.id);
      this.registros[index] = response.registro;
    }
  }
}


onEdit(event): void {
  
  const modal = this.modalService.open(OperadorFormComponent,{windowClass:"my-class"});
  modal.result.then((data) => {
    this.loadData(); // on close
  }, (reason) => {
    // on dismiss
    this.handleModalOperadorFormClose.bind(this),
    this.handleModalOperadorFormClose.bind(this)
  });
  modal.componentInstance.createMode = false;
  modal.componentInstance.registro_id = event.data.Id;

}

onDelete(event): void {
  //  console.info(event);
    const {Id,  Nombres, Nroidentificacion } = event.data;
    const opt: any = {
      title: 'Borrar Operador?',
      text: `Seguro que desea borrar el registro del operador : ${Nombres} ?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6f8ec7',//'#DD6B55',
      confirmButtonText: 'Si, Borrar!',
      cancelButtonText: "No, cancelar!",
      //buttons: true,
      //dangerMode: true,
      //showCancelButton: true,

    };
    Swal(opt)
      .then((willDelete) => {
        if (willDelete.value) { 
          //verifica si el reporte ya existe
          this.registroService.get('reporteami/0/'+parseInt(Id,10))
          .subscribe(res => {
            //console.log(res);
            if (Object.keys(res).length>0) {
                this.showToast('error', 'Gestionar operador', 'El operador tiene reportes registrados, no es posible borrarlo');
                //this.eventChange.emit(true);
              }
            else
              {
                const borra={"Id":Id};
                this.registroService.delRegistro('operador', borra).subscribe(res => {
                    if (res !== null) {
                      this.loadData();
                      this.showToast('info', 'Gestionar operador', 'Operador borrado exitosamente');
                    }
                    else
                    {
                      this.loadData();
                      this.showToast('error', 'Gestionar operador', 'No fue posible borrar el operador');
                    }
                  });

              }
          });

        }
      });
  }

  itemselec(event): void {
    // console.log("afssaf");
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
