import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ParametroFormComponent } from '../parametro-form/parametro-form.component';

import { LocalDataSource } from 'ng2-smart-table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ParametroService } from '../../../@core/data/services/parametro.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as moment from 'moment';
import { ParametroView } from '../../../@core/data/models/parametro/parametro_view';

@Component({
  selector: 'app-parametro-list',
  templateUrl: './parametro-list.component.html',
  styleUrls: ['./parametro-list.component.scss']
})
export class ParametroListComponent implements OnInit {

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
  //handleModalParametrosFormClose: any;

  constructor(private modalService: NgbModal, private translate: TranslateService,
              private registroService: ParametroService, private toasterService: ToasterService,
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
    let delaction=false;
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
      pager: {perPage: 15 },
      columns: {
        // Id: {
        //   title: this.translate.instant('GLOBAL.parametro.id'),
        //   // type: 'number;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        Tipo: {
          title: this.translate.instant('GLOBAL.parametro.tipo'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Nombre: {
          title: this.translate.instant('GLOBAL.parametro.nombre'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.parametro.descripcion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Estado: {
          title: this.translate.instant('GLOBAL.parametro.estado'),
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
    // rescata el idparametro asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
        this.user_operador = user.operador;
        this.user_rol = user.id;
    });
  }

  loadData(): void {
    this.registroService.get('variable?limit=0').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        // console.log(data)
        this.source.load(data);
      }
    });
  }

  ngOnInit() {
  }

 registros: ParametroView[] = [];

 onCreate(event) {
    const modal = this.modalService.open(ParametroFormComponent,{windowClass:"my-class"});
    modal.result.then((data) => {
      this.loadData(); // on close
    }, (reason) => {
      // on dismiss
      this.handleModalParametroFormClose.bind(this),
      this.handleModalParametroFormClose.bind(this)
    });
}


handleModalParametroFormClose(response) {
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
  
  const modal = this.modalService.open(ParametroFormComponent,{windowClass:"my-class"});
  modal.result.then((data) => {
    this.loadData(); // on close
  }, (reason) => {
    // on dismiss
    this.handleModalParametroFormClose.bind(this),
    this.handleModalParametroFormClose.bind(this)
  });
  modal.componentInstance.createMode = false;
  modal.componentInstance.registro_id = event.data.Id;

}

onDelete(event): void {
  //  console.info(event);
    const {Id,  Nombre } = event.data;
    const opt: any = {
      title: 'Borrar Parametro?',
      text: `Seguro que desea borrar el registro del parametro : ${Nombre} ?`,
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
          this.registroService.delRegistro('variable', borra).subscribe(res => {
              if (res !== null) {
                this.loadData();
                this.showToast('info', 'Gestionar parametro', 'Parametro borrado exitosamente');
              }
              else
              {
                this.loadData();
                this.showToast('error', 'Gestionar parametro', 'No fue posible borrar el parametro');
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
