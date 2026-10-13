import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactoFormComponent } from '../contacto-form/contacto-form.component';

import { ExcelServicesService } from '../../../@core/data/excel-services.service';
import { LocalDataSource } from 'ng2-smart-table';
import { ContactoService } from '../../../@core/data/services/contacto.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as moment from 'moment';
import { ContactoView } from '../../../@core/data/models/operador/contacto_view';


@Component({
  selector: 'app-contacto-list',
  templateUrl: './contacto-list.component.html',
  styleUrls: ['./contacto-list.component.scss']
})
export class ContactoListComponent implements OnInit {

  uid: number;
  user_operador: number;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  excel=[];
  source: LocalDataSource = new LocalDataSource();  
  //handleModalContactoFormClose: any;

  constructor(private modalService: NgbModal, private translate: TranslateService, private registroService: ContactoService,
              private toasterService: ToasterService, private excelService:ExcelServicesService) {
    this.load_UserData(); 
    this.loadData();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  cargarCampos() {
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
      // actions: { delete: false },
      mode: 'external',
      columns: {
        // Id: {
        //   title: this.translate.instant('GLOBAL.contacto.id'),
        //   // type: 'number;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        Operador: {
          title: this.translate.instant('GLOBAL.contacto.operador'),
          // type: 'tipo_identificacion;',
          valuePrepareFunction: (value) => {
            return value.Coordinacionoperativa ? value.Coordinacionoperativa : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Coordinacionoperativa + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Nombres: {
          title: this.translate.instant('GLOBAL.contacto.nombres'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Apellidos: {
          title: this.translate.instant('GLOBAL.contacto.apellidos'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Tipoidentificacion: {
          title: this.translate.instant('GLOBAL.contacto.tipoidentificacion'),
          // type: 'tipo_identificacion;',
          valuePrepareFunction: (value) => {
            return value.NombreIdentificacion ? value.NombreIdentificacion : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreIdentificacion + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Nroidentificacion: {
          title: this.translate.instant('GLOBAL.contacto.nroidentificacion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Cargo: {
          title: this.translate.instant('GLOBAL.contacto.cargo'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Indicativo: {
          title: this.translate.instant('GLOBAL.contacto.indicativo'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Telefonofijo: {
          title: this.translate.instant('GLOBAL.contacto.telefonofijo'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Celular: {
          title: this.translate.instant('GLOBAL.contacto.celular'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Correo: {
          title: this.translate.instant('GLOBAL.contacto.correo'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Estadocontacto: {
          title: this.translate.instant('GLOBAL.contacto.estadocontacto'),
          // type: 'tipo_estado;',
          valuePrepareFunction: (value) => {
            return value.NombreEstado ? value.NombreEstado : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreEstado + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Fechacreacion: {
          title: this.translate.instant('GLOBAL.contacto.fechacreacion'),
          // type: 'Date;',
          valuePrepareFunction: (value) => {
            return moment(value).format('YYYY/MM/DD HH:mm:SS');
          },
        },
      },
    };
  }

  loadData(): void {
    this.registroService.get('contactoop/0/'+this.user_operador+'?limit=0').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        //console.info(data)
        this.source.load(data);
        //PARA EXPORTAR EXCEL
        this.excel=[];
        let arrayText:any;
        data.forEach(row => {
        arrayText = {
            Empresa_Servicios: row.Operador.Coordinacionoperativa,
            Nombres: row.Nombres,
            Apellidos:row.Apellidos,
            Tipoidentificacion:row.Tipoidentificacion.NombreIdentificacion,
            Nroidentificacion:row.Nroidentificacion,
            Cargo:row.Cargo,  
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
    this.excelService.exportAsExcelFile(this.excel, 'Contactos_Empresas_servicios');
  }

  ngOnInit() {
  }

registros: ContactoView[] = [];

 load_UserData(): void {
  // rescata el idoperador asociado al usuario
  this.registroService.user$
  .subscribe((user: any) => {
      //this.uid = user.id;
      this.user_operador = user.operador;
  });
}

 onCreate(event) {
    const modal = this.modalService.open(ContactoFormComponent,{windowClass:"my-class"});
    modal.result.then((data) => {
      this.loadData(); // on close
    }, (reason) => {
      // on dismiss
      this.handleModalContactoFormClose.bind(this),
      this.handleModalContactoFormClose.bind(this)
    });
}

handleModalContactoFormClose(response) {
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
  
  const modal = this.modalService.open(ContactoFormComponent,{windowClass:"my-class"});
  modal.result.then((data) => {
    this.loadData(); // on close
  }, (reason) => {
    // on dismiss
    this.handleModalContactoFormClose.bind(this),
    this.handleModalContactoFormClose.bind(this)
  });
  modal.componentInstance.createMode = false;
  modal.componentInstance.registro_id = event.data.Id;

}

onDelete(event): void {
  //  console.info(event);
    const {Id,  Nombres, Apellidos, Nroidentificacion } = event.data;
    const opt: any = {
      title: 'Borrar Contacto?',
      text: `Seguro que desea borrar el registro del contacto : ${Nombres} ${Apellidos} ?`,
      // 'success' | 'error' | 'warning' | 'info' | 'question'
      type: 'question',
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
          const borra={"Id":Id};
          this.registroService.delRegistro('contactoop', borra).subscribe(res => {
              if (res !== null) {
                this.loadData();
                this.showToast('info', 'Gestionar contacto', 'Contacto borrado exitosamente');
              }
              else
              {
                this.loadData();
                this.showToast('error', 'Gestionar contacto', 'No fue posible borrar el contacto');
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
