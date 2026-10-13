import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PerfilFormComponent } from '../perfil-form/perfil-form.component';

import { LocalDataSource } from 'ng2-smart-table';
import { PerfilService } from '../../../@core/data/services/perfil.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as moment from 'moment';
import { PerfilView } from '../../../@core/data/models/perfil/perfil_view';

@Component({
  selector: 'app-perfil-list',
  templateUrl: './perfil-list.component.html',
  styleUrls: ['./perfil-list.component.scss']
})
export class PerfilListComponent implements OnInit {

  uid: number;
  user_operador: number;
  user_rol: number;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;

  source: LocalDataSource = new LocalDataSource();  
  //handleModalPerfilsFormClose: any;

  constructor(private modalService: NgbModal, private translate: TranslateService, private registroService: PerfilService, private toasterService: ToasterService) {
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
        //   title: this.translate.instant('GLOBAL.perfil.id'),
        //   // type: 'number;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        Rol: {
          title: this.translate.instant('GLOBAL.perfil.rol'),
          // type: 'tipo_identificacion;',
          valuePrepareFunction: (value) => {
            return value.Nombre ? value.Nombre : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Nombre + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Enlace: {
          title: this.translate.instant('GLOBAL.perfil.enlace'),
          // type: 'tipo_identificacion;',
          valuePrepareFunction: (value) => {
            return value.Nombre ? value.Nombre : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Nombre + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Observacion: {
          title: this.translate.instant('GLOBAL.perfil.observacion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Estado: {
          title: this.translate.instant('GLOBAL.perfil.estado'),
          // type: 'tipo_estado;',
          valuePrepareFunction: (value) => {
            return value.NombreEstado ? value.NombreEstado : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreEstado + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Fechacreacion: {
          title: this.translate.instant('GLOBAL.perfil.fechacreacion'),
          // type: 'Date;',
          valuePrepareFunction: (value) => {
            return moment(value).format('YYYY/MM/DD HH:mm:SS');
          },
        },
      },
    };
  }

  load_UserData(): void {
    // rescata el idperfil asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
        //this.uid = user.id;
        this.user_operador = user.operador;
        this.user_rol = user.id;
    });
  }

  loadData(): void {
    this.registroService.get('perfilmenu/?limit=0').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        let datos= []
        this.source.load(data);
      }
    });
  }

  ngOnInit() {
  }

 registros: PerfilView[] = [];

 onCreate(event) {
    const modal = this.modalService.open(PerfilFormComponent,{windowClass:"my-class"});
    modal.result.then((data) => {
      this.loadData(); // on close
    }, (reason) => {
      // on dismiss
      this.handleModalPerfilFormClose.bind(this),
      this.handleModalPerfilFormClose.bind(this)
    });
}

handleModalPerfilFormClose(response) {
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
  
  const modal = this.modalService.open(PerfilFormComponent,{windowClass:"my-class"});
  modal.result.then((data) => {
    this.loadData(); // on close
  }, (reason) => {
    // on dismiss
    this.handleModalPerfilFormClose.bind(this),
    this.handleModalPerfilFormClose.bind(this)
  });
  modal.componentInstance.createMode = false;
  modal.componentInstance.registro_id = event.data.Id;

}

onDelete(event): void {
    const {Id, Rol,  Enlace } = event.data;
    const opt: any = {
      title: 'Borrar Perfil?',
      text: `Seguro que desea borrar el registro del perfil : "${Enlace.Nombre}" del rol "${Rol.Nombre}"  ?`,
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
          this.registroService.delRegistro('perfilmenu', borra).subscribe(res => {
            if (res !== null) {
              this.loadData();
              this.showToast('info', 'Gestionar perfil', 'Perfil borrado exitosamente');
            }
            else
            {
              this.loadData();
              this.showToast('error', 'Gestionar perfil', 'No fue posible borrar el perfil');
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
