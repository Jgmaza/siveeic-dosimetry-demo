import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RolFormComponent } from '../rol-form/rol-form.component';

import { LocalDataSource } from 'ng2-smart-table';
import { RolService } from '../../../@core/data/services/rol.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as moment from 'moment';
import { RolView } from '../../../@core/data/models/perfil/rol_view';

@Component({
  selector: 'app-rol-list',
  templateUrl: './rol-list.component.html',
  styleUrls: ['./rol-list.component.scss']
})
export class RolListComponent implements OnInit {

  uid: number;
  user_operador: number;
  user_rol: number;

  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;

  source: LocalDataSource = new LocalDataSource();  
  //handleModalRolsFormClose: any;

  constructor(private modalService: NgbModal, private translate: TranslateService, private registroService: RolService, private toasterService: ToasterService) {
    this.load_UserData();
    this.loadData();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
   
  }
    
  cargarCampos() {

    let addaction=true;
    let delaction=true;
    if(this.user_rol !==1)
      { addaction=false;
        delaction=false;
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
      actions: { add: addaction,
                 delete: delaction },
      mode: 'external',
      pager: {
        display: true,
        perPage: 15,
        doEmit: false, 
      },
      columns: {
        // Id: {
        //   title: this.translate.instant('GLOBAL.rol.id'),
        //   // type: 'number;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        Nombre: {
          title: this.translate.instant('GLOBAL.rol.nombre'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.rol.descripcion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Estado: {
          title: this.translate.instant('GLOBAL.rol.estado'),
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
    // rescata el idrol asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
        this.user_operador = user.operador;
        this.user_rol = user.id;
    });
  }

  loadData(): void {
    this.registroService.get('tipo_usuario/0/rol?limit=0').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        // console.log(data)
        let datos= []
        for(var i = 0; i < data.length;i++){
           // this.excel
            data[i].Nombre=data[i].NombreTipo;
            data[i].Descripcion=data[i].DescTipo;
            data[i].Estado=data[i].EstTipo;
            }
        this.source.load(data);
      }
    });
  }

  ngOnInit() {
  }

 registros: RolView[] = [];

 onCreate(event) {
    const modal = this.modalService.open(RolFormComponent,{windowClass:"my-class"});
    modal.result.then((data) => {
      this.loadData(); // on close
    }, (reason) => {
      // on dismiss
      this.handleModalRolFormClose.bind(this),
      this.handleModalRolFormClose.bind(this)
    });
}


handleModalRolFormClose(response) {
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
  
  const modal = this.modalService.open(RolFormComponent,{windowClass:"my-class"});
  modal.result.then((data) => {
    this.loadData(); // on close
  }, (reason) => {
    // on dismiss
    this.handleModalRolFormClose.bind(this),
    this.handleModalRolFormClose.bind(this)
  });
  modal.componentInstance.createMode = false;
  modal.componentInstance.registro_id = event.data.Id;

}

onDelete(event): void {
  //  console.info(event);
    const {Id,  Nombre } = event.data;
    const opt: any = {
      title: 'Borrar Rol?',
      text: `Seguro que desea borrar el registro del rol : ${Nombre} ?`,
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
          this.registroService.get('usuario/0/'+parseInt(Id,10))
          .subscribe(res => {
            //console.log(res);
            if (Object.keys(res).length>0) {
                this.showToast('error', 'Gestionar rol', 'El rol tiene usuarios asociados, no es posible borrarlo');
                //this.eventChange.emit(true);
              }
            else
              {
                const borra={"Id":Id};
                this.registroService.delRegistro('tipo_usuario', borra).subscribe(res => {
                    if (res !== null) {
                      this.loadData();
                      this.showToast('info', 'Gestionar rol', 'Rol borrado exitosamente');
                    }
                    else
                    {
                      this.loadData();
                      this.showToast('error', 'Gestionar rol', 'No fue posible borrar el rol');
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
