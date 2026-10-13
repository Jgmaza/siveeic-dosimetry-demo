import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EnlaceFormComponent } from '../enlace-form/enlace-form.component';

import { LocalDataSource } from 'ng2-smart-table';
import { EnlaceService } from '../../../@core/data/services/enlace.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as moment from 'moment';
import { EnlaceView } from '../../../@core/data/models/menu/enlace_view';

@Component({
  selector: 'app-enlace-list',
  templateUrl: './enlace-list.component.html',
  styleUrls: ['./enlace-list.component.scss']
})
export class EnlaceListComponent implements OnInit {

  uid: number;
  user_operador: number;
  user_rol: number;

  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;

  source: LocalDataSource = new LocalDataSource();  
  //handleModalEnlacesFormClose: any;

  constructor(private modalService: NgbModal, private translate: TranslateService, private registroService: EnlaceService, private toasterService: ToasterService) {
    this.load_UserData();
    this.loadData();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
   
  }
    

  cargarCampos() {

    let addaction=true;
    let delaction=false;
    let editaction=false;

    if(this.user_rol !==1)
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
      actions: {
        columnTitle: 'Acciones',
        add: addaction,
        delete: delaction,
        edit: editaction,
        custom: [
          {
            name: 'duplicateAction',
            title: '<i class="nb-layout-two-column" title="Duplicar Enlace"></i>',
            position: 'right',
          },
          {
            name: 'editAction',
            title: '<i class="nb-edit" title="Editar Enlace"></i>',
            position: 'right',
          },
          {
            name: 'deleteAction',
            title: '<i class="nb-trash" title="Borrar Tablero" ></i>',
            position: 'right',
          }
        ]
      },  
      mode: 'external',
      pager: {
        display: true,
        perPage: 15,
        doEmit: false, 
      },
      columns: {
        // Id: {
        //   title: this.translate.instant('GLOBAL.enlace.id'),
        //   // type: 'number;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        Grupo: {
          title: this.translate.instant('GLOBAL.enlace.grupo'),
          // type: 'tipo_identificacion;',
          valuePrepareFunction: (value) => {
            return value.Nombre ? value.Nombre : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Nombre + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Nombre: {
          title: this.translate.instant('GLOBAL.enlace.nombre'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Titulo: {
          title: this.translate.instant('GLOBAL.enlace.titulo_enlace'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Enlace: {
          title: this.translate.instant('GLOBAL.enlace.ruta_enlace'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Posicion: {
          title: this.translate.instant('GLOBAL.enlace.posicion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Key: {
          title: this.translate.instant('GLOBAL.enlace.key'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Estado: {
          title: this.translate.instant('GLOBAL.enlace.estado'),
          // type: 'tipo_estado;',
          valuePrepareFunction: (value) => {
            return value.NombreEstado ? value.NombreEstado : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreEstado + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Fechacreacion: {
          title: this.translate.instant('GLOBAL.enlace.fechacreacion'),
          // type: 'Date;',
          valuePrepareFunction: (value) => {
            return moment(value).format('YYYY/MM/DD HH:mm:SS');
          },
        },
      },
    };
  }

  load_UserData(): void {
    // rescata el idenlace asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
        //this.uid = user.id;
//        console.log(user)
        this.user_operador = user.operador;
        this.user_rol = user.id;
    });
  }

  loadData(): void {
    this.registroService.get('enlacemenu/?limit=0').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        let datos= []
        for(var i = 0; i < data.length;i++){
           // this.excel
            data[i].Titulo=data[i].Datos_enlace.title;
            data[i].Enlace=data[i].Datos_enlace.link;
            data[i].Key=data[i].Datos_enlace.key;
            }
        this.source.load(data);
      }
    });
  }

  ngOnInit() {
  }

 registros: EnlaceView[] = [];


 onCreate(event) {
    const modal = this.modalService.open(EnlaceFormComponent,{windowClass:"my-class"});
    modal.result.then((data) => {
      this.loadData(); // on close
    }, (reason) => {
      // on dismiss
      this.handleModalEnlaceFormClose.bind(this),
      this.handleModalEnlaceFormClose.bind(this)
    });
}


handleModalEnlaceFormClose(response) {
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
  
  const modal = this.modalService.open(EnlaceFormComponent,{windowClass:"my-class"});
  modal.result.then((data) => {
    this.loadData(); // on close
  }, (reason) => {
    // on dismiss
    this.handleModalEnlaceFormClose.bind(this),
    this.handleModalEnlaceFormClose.bind(this)
  });
  modal.componentInstance.createMode = false;
  modal.componentInstance.duplicateMode = false;
  modal.componentInstance.registro_id = event.data.Id;
}

onDuplicate(event): void {
  
  const modal = this.modalService.open(EnlaceFormComponent,{windowClass:"my-class"});
  modal.result.then((data) => {
    this.loadData(); // on close
  }, (reason) => {
    // on dismiss
    this.handleModalEnlaceFormClose.bind(this),
    this.handleModalEnlaceFormClose.bind(this)
  });
  modal.componentInstance.createMode = true;
  modal.componentInstance.duplicateMode = true;
  modal.componentInstance.registro_id = event.data.Id;

}

onDelete(event): void {
  //  console.info(event);
    const {Id,  Nombre } = event.data;
    const opt: any = {
      title: 'Borrar Enlaces?',
      text: `Seguro que desea borrar el registro del enlace : ${Nombre} ?`,
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
          this.registroService.get('perfilmenu/0/0/'+parseInt(Id,10))
          .subscribe(res => {
            //console.log(res);
            if (Object.keys(res).length>0) {
                this.showToast('error', 'Gestionar enlace', 'El enlace tiene perfiles asociados, no es posible borrarlo');
                //this.eventChange.emit(true);
              }
            else
              {
                const borra={"Id":Id};
                this.registroService.delRegistro('enlacemenu', borra).subscribe(res => {
                    if (res !== null) {
                      this.loadData();
                      this.showToast('info', 'Gestionar enlace', 'Enlaces borrado exitosamente');
                    }
                    else
                    {
                      this.loadData();
                      this.showToast('error', 'Gestionar enlace', 'No fue posible borrar el enlace');
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
