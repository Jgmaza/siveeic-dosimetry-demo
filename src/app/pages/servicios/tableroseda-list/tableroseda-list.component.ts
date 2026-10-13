import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TableroedaFormComponent } from '../tableroseda-form/tableroseda-form.component';
import { VersionedaFormComponent } from '../versioneseda-form/versioneseda-form.component';

import { LocalDataSource } from 'ng2-smart-table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableroedaService } from '../../../@core/data/services/tableroseda.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as moment from 'moment';
import { TableroedaView } from '../../../@core/data/models/tableroseda/tableroseda_view';

@Component({
  selector: 'app-tableroseda-list',
  templateUrl: './tableroseda-list.component.html',
  styleUrls: ['./tableroseda-list.component.scss']
})
export class TableroedaListComponent implements OnInit {

  uid: number;
  user_operador: number;
  user_rol: number;

  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  source: LocalDataSource = new LocalDataSource();  
  rowspage:any;
 
  filtrarForm: FormGroup;
  registroForm: FormGroup;
  //handleModalTableroedasFormClose: any;

  constructor(private modalService: NgbModal, private translate: TranslateService,
              private registroService: TableroedaService, private toasterService: ToasterService,
              private formBuilder: FormBuilder) {
    this.load_UserData();
    this.construirForm();
    this.loadData();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
   
  }
    
  construirForm() {
      this.registroForm = this.formBuilder.group({
      Rowspage: [null],
});
  }

  paginas(): void {
    this.rowspage=this.registroForm.get('Rowspage').value;
    this.source.setPaging(1,this.rowspage);
  } 

  cargarCampos() {

    let addaction=true;
    let editaction=false;
    let delaction=false;
    if(this.user_rol !==1)
      { addaction=false;
        delaction=false;
        editaction=false;
      }

    this.settings = {
      //selectMode: 'multi',
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
      actions: {
                  columnTitle: 'Acciones',
                  add: addaction,
                  delete: delaction,
                  edit: editaction,
                  custom: [
                    {
                      name: 'duplicateAction',
                      title: '<i class="nb-layout-two-column" title="Duplicar Tablero"></i>',
                      position: 'right',
                    },
                    {
                      name: 'editAction',
                      title: '<i class="nb-edit" title="Editar Tablero"></i>',
                      position: 'right',
                    },
                    {
                      name: 'deleteAction',
                      title: '<i class="nb-trash" title="Borrar Tablero" ></i>',
                      position: 'right',
                    },
                    {
                      name: 'deleteVersionAction',
                      title: '<i class="nb-compose" title="Borrar Versión de Tablero" ></i>',
                      position: 'right',
                    }
                  ]
                },   
      mode: 'external',
      pager: {perPage: 15 },
      columns: {
        // Id: {
        //   title: this.translate.instant('GLOBAL.tableroseda.id'),
        //   // type: 'number;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        Nombre: {
          title: this.translate.instant('GLOBAL.tableroseda.nombre'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.tableroseda.descripcion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Puntoacceso: {
          title: this.translate.instant('GLOBAL.tableroseda.puntoacceso'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },

        Servidor: {
          title: this.translate.instant('GLOBAL.tableroseda.servidor'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },

        Pagina: {
          title: this.translate.instant('GLOBAL.tableroseda.pagina'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },

        Servicio: {
          title: this.translate.instant('GLOBAL.tableroseda.servicio'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },


        Titulo: {
          title: this.translate.instant('GLOBAL.tableroseda.titulo'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },


        Estado: {
          title: this.translate.instant('GLOBAL.tableroseda.estado'),
          // type: 'tipo_estado;',
          valuePrepareFunction: (value) => {
            return value.NombreEstado ? value.NombreEstado : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreEstado + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
      },
    };
  }

  load_UserData(): void {
    // rescata el idtableroseda asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
        this.user_operador = user.operador;
        this.user_rol = user.id;
    });
  }

  loadData(): void {
    this.registroService.get('tableroseda').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        // console.log(data)
        this.source.load(data);
      }
    });
  }

  ngOnInit() {
  }

 registros: TableroedaView[] = [];

 onCreate(event) {
    const modal = this.modalService.open(TableroedaFormComponent,{windowClass:"my-class"});
    modal.result.then((data) => {
      this.loadData(); // on close
    }, (reason) => {
      // on dismiss
      this.handleModalTableroedaFormClose.bind(this),
      this.handleModalTableroedaFormClose.bind(this)
    });
}


handleModalTableroedaFormClose(response) {
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

onCustomAction(event): void {
  //alert(`Custom event '${event.action}' fired on row №: ${event.data.Id}`);
  switch(event.action) { 
        case 'editAction': { 
          this.onEdit(event); 
          break; 
          }
        case 'deleteAction': { 
          this.onDelete(event)
          break; 
        } 
        case 'deleteVersionAction': { 
          this.onVersiones(event)
          break; 
        } 
        case 'duplicateAction': { 
          this.onDuplicate(event)
          break; 
        } 
        default: { 
          //statements; 
          break; 
        } 
    } 
}  

onEdit(event): void {
  
  const modal = this.modalService.open(TableroedaFormComponent,{windowClass:"my-class"});
  modal.result.then((data) => {
    this.loadData(); // on close
  }, (reason) => {
    // on dismiss
    this.handleModalTableroedaFormClose.bind(this),
    this.handleModalTableroedaFormClose.bind(this)
  });
  modal.componentInstance.duplicateMode = false;
  modal.componentInstance.createMode = false;
  modal.componentInstance.registro_id = event.data.Id;
}

onDuplicate(event): void {
  
  const modal = this.modalService.open(TableroedaFormComponent,{windowClass:"my-class"});
  modal.result.then((data) => {
    this.loadData(); // on close
  }, (reason) => {
    // on dismiss
    this.handleModalTableroedaFormClose.bind(this),
    this.handleModalTableroedaFormClose.bind(this)
  });
  modal.componentInstance.duplicateMode = true;
  modal.componentInstance.createMode = true;
  modal.componentInstance.registro_id = event.data.Id;
}

onVersiones(event): void {
  
  const modal = this.modalService.open(VersionedaFormComponent,{windowClass:"my-class"});
  modal.result.then((data) => {
    this.loadData(); // on close
  }, (reason) => {
    // on dismiss
    this.handleModalTableroedaFormClose.bind(this),
    this.handleModalTableroedaFormClose.bind(this)
  });
  modal.componentInstance.createMode = false;
  modal.componentInstance.registro_id = event.data.Id;
}


onDelete(event): void {
    const {Id,  Nombre } = event.data;
    const opt: any = {
      title: 'Borrar Tablero?',
      text: `Seguro que desea borrar el registro del tablero}: ${Nombre} ?`,
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
          const borra={"Id":Id};
          this.registroService.delRegistro('tableroseda', borra).subscribe(res => {
              if (res !== null) {
                this.loadData();
                this.showToast('info', 'Gestionar tableros', 'Tableroeda borrado exitosamente');
              }
              else
              {
                this.loadData();
                this.showToast('error', 'Gestionar tableros', 'No fue posible borrar el tableroseda');
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
