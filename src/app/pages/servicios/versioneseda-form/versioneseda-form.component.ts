import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

import { TableroedaService } from '../../../@core/data/services/tableroseda.service';
import { TableroedaView } from '../../../@core/data/models/tableroseda/tableroseda_view';
import { Tableroeda } from '../../../@core/data/models/tableroseda/tableroseda';
import { TipoEstado } from '../../../@core/data/models/tipo_estado';


@Component({
  selector: 'app-versioneseda-form',
  templateUrl: './versioneseda-form.component.html',
  styleUrls: ['./versioneseda-form.component.scss']
})
export class VersionedaFormComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  user_operador: any;
  uid: number;
  createMode: boolean = true;
  duplicateMode: boolean = false;
  registro: TableroedaView;
  registroForm: FormGroup;
  /*variables para definir los selects de formulario */

  Tableroedapadre = [];
  Version = [];
  /* */
  registro_id: number;
  data_tableroseda: any;

  @Output() eventChange = new EventEmitter();

  info_tableroseda: Tableroeda;
  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      public activeModal: NgbActiveModal,
      private registroService: TableroedaService,
      private toasterService: ToasterService
  ) {
  
  this.load_UserData();
  this.construirForm();
  
 }

 construirForm() {

  this.registroForm = this.formBuilder.group({
    Version: [null, Validators.required],
    Nombre: [{ value: "", disabled: true },  Validators.compose([Validators.minLength(3),Validators.maxLength(100),Validators.pattern('^[a-zA-ZáéíóúáéíóúÁÉÍÓÚ0-9_.,-\u00f1\u00d1\\s]+$') ]) ],
    });
}

  ngOnInit() {
    //carga los datos rescatados

    if (!this.createMode) {
      this.loadRegistro(this.registro_id); 
    }
    this.loadOptionsVersionestableroseda(this.registro_id);  
  }

  load_UserData(): void {
    // rescata el idoperador asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
      this.user_operador = user.operador;
      this.uid = user.id;
    });
   // console.info(this.user_operador);
  } 

  loadRegistro(registro_id){
    let registro_info: Tableroeda;
    this.registroService.get('tableroseda/' + registro_id)
    .subscribe(res => {
      if (res !== null) {
        registro_info = <Tableroeda>res;
        //console.log(registro_info)
        this.registroForm.patchValue(registro_info[0]);  
      }
    });
  }

    /*
    ### funcion para comparar y seleccionar la opcion, se coloca los siguiente en select de html
    ### [(ngModel)]="selected_Tipoidentificacion" [compareWith]="compareById"
    */
    compareById(o1,o2){
      if(o1 == null || o2 == null){
        return false;
      }
      return o1.Id === o2.Id;
    }

  saveRegistro() {
      if (this.registroForm.invalid) {
        return;
      }
        let registro: Tableroeda = this.registroForm.value;
        registro.Usuarioreporta = this.uid;
      if (this.createMode){
      } else{
        const opt: any = {
          title: 'Gestionar tableros Eda',
          text: 'Seguro que desea borrar la versión del tablero?',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#6f8ec7',//'#DD6B55',
          confirmButtonText: 'Si, actualizar!',
          cancelButtonText: "No, cancelar!",
        };
        Swal(opt)
          .then((willDelete) => {
            if (willDelete.value) {
                registro.Id=this.registro_id;
                //  console.info(registro);
                this.registroService.putVersion('versioneda', registro).subscribe(res => {
                  let resultado = <any>res;
                  //VERIFICA SI SE REGISTRO EL estaciones;
                  if(resultado === null )
                    {
                      this.showToast('warning', 'Gestión tableros!', 'No fue posible borra la versión del tablero, intente de nuevo');
                      this.activeModal.close();
                    }
                  else
                    { 
                      this.eventChange.emit(true);
                      this.showToast('success', 'Gestión tableros', 'Versión de Tablero borrada exitosamente');
                      this.activeModal.close();
                    }
                });
            }
          });
      }
  }


  loadOptionsVersionestableroseda(registro_id): void {
    this.registroService.get('versioneda/'+registro_id)
      .subscribe(res => {
        if (res !== null) {
          this.Version = <Array<any>>res;
          this.registroForm.patchValue(this.Version);
        }
      });
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
