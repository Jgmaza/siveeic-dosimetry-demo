import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TodoFormComponent } from '../todo-form/todo-form.component';

//import { TodoService } from '../services/todo.service';
//import { TodoViewModel } from '../models/todo-view-model';


import { LocalDataSource } from 'ng2-smart-table';
import { OperadorService } from '../../../@core/data/services/operador.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as moment from 'moment';
import { OperadorView } from '../../../@core/data/models/operador/operador_view';


@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {

  uid: number;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;

  source: LocalDataSource = new LocalDataSource();  
  //handleModalTodoFormClose: any;

  constructor(private modalService: NgbModal, private translate: TranslateService, private registroService: OperadorService, private toasterService: ToasterService) {
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
        //   title: this.translate.instant('GLOBAL.operador.id'),
        //   // type: 'number;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        Nombres: {
          title: this.translate.instant('GLOBAL.operador.nombres'),
          // type: 'string;',
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
        Correo: {
          title: this.translate.instant('GLOBAL.operador.correo'),
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

  loadData(): void {
    this.registroService.get('operador/?limit=0').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        this.source.load(data);
      }
    });
  }

  ngOnInit() {
  }

 registros: OperadorView[] = [];

 onCreate(event) {
    const modal = this.modalService.open(TodoFormComponent,{windowClass:"my-class"});
    modal.result.then((data) => {
      this.loadData(); // on close
    }, (reason) => {
      // on dismiss
      this.handleModalTodoFormClose.bind(this),
      this.handleModalTodoFormClose.bind(this)
    });
}

handleModalTodoFormClose(response) {
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
  
  const modal = this.modalService.open(TodoFormComponent,{windowClass:"my-class"});
  modal.result.then((data) => {
    this.loadData(); // on close
  }, (reason) => {
    // on dismiss
    this.handleModalTodoFormClose.bind(this),
    this.handleModalTodoFormClose.bind(this)
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
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
      .then((willDelete) => {
        if (willDelete.value) {
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
