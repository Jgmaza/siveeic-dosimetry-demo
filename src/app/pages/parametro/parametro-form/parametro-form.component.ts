import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

import { ParametroService } from '../../../@core/data/services/parametro.service';
import { ParametroView } from '../../../@core/data/models/parametro/parametro_view';
import { Parametro } from '../../../@core/data/models/parametro/parametro';
import { TipoEstado } from '../../../@core/data/models/tipo_estado';


@Component({
  selector: 'app-parametro-form',
  templateUrl: './parametro-form.component.html',
  styleUrls: ['./parametro-form.component.scss']
})
export class ParametroFormComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  user_operador: any;
  createMode: boolean = true;
  registro: ParametroView;
  parametroForm: FormGroup;
  /*variables para definir los selects de formulario */

  Parametropadre = [];
  Estado = [];
  /* */
  registro_id: number;
  data_parametro: any;

  @Output() eventChange = new EventEmitter();

  info_parametro: Parametro;
  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      public activeModal: NgbActiveModal,
      private registroService: ParametroService,
      private toasterService: ToasterService
  ) {
  
  this.load_UserData();
  this.construirForm();
  this.loadOptionsEstadoparametro();

 }

 construirForm() {

  this.parametroForm = this.formBuilder.group({
    Estado: [null, Validators.required],
    Nombre: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(100) ]) ],
    Tipo: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(100) ]) ],
    Descripcion: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(255) ]) ],
  });
}

  ngOnInit() {
    //carga los datos rescatados
    if (!this.createMode) {
      this.loadRegistro(this.registro_id); 
    }
  }

  load_UserData(): void {
    // rescata el idparametro asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
        this.user_operador = user;
    });
   // console.info(this.user_operador);
  } 



  loadRegistro(registro_id){
    let registro_info: Parametro;
    this.registroService.get('variable/' + registro_id)
    .subscribe(res => {
      if (res !== null) {
        registro_info = <Parametro>res;
        //console.log(registro_info)
        this.parametroForm.patchValue(registro_info[0]);  
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
      if (this.parametroForm.invalid) {
        return;
      }
        let registro: Parametro = this.parametroForm.value;
        if (this.createMode){
          //let registro: Parametro = this.parametroForm.value;
          //console.info(registro);
          this.registroService.postRegistro('variable', registro)
            .subscribe(res => {
              let resultado = <Parametro>res;
              //VERIFICA SI SE REGISTRO EL parametro;
              if(resultado === null )
                {
                  this.showToast('error', 'Gestión parametro!', 'No fue posible registrar el parametro, intente de nuevo');
                  this.eventChange.emit(true);
                }
              else
                { 
                  this.eventChange.emit(true);
                  this.showToast('info', 'Gestión parametro', 'Parametro registrado exitosamente');
                  this.activeModal.close();
                }
            });
      } else{

        const opt: any = {
          title: 'Gestionar parametro',
          text: 'Seguro que desea de actualizar los datos del parametro?',
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
              this.registroService.putRegistro('variable', registro)
                .subscribe(res => {
                      let resultado = <Parametro>res;
                      //VERIFICA SI SE REGISTRO EL parametro;
                      if(resultado === null )
                      {
                        this.showToast('error', 'Gestión parametro!', 'No fue posible actualizar los datos del parametro, intente de nuevo');
                        this.eventChange.emit(true);
                      }
                      else
                      { 
                        this.eventChange.emit(true);
                        this.showToast('info', 'Gestión parametro', 'Datos de parametro actualizados, exitosamente!');
                        this.activeModal.close();
                      }
                });
            }
          });
      }

  }


  loadOptionsEstadoparametro(): void {
    let estadoparametro: any=TipoEstado;
    this.registroService.get('tipo_estado')
      .subscribe(res => {
        if (res !== null) {
          this.Estado = <Array<TipoEstado>>res;
          //se selleciona la opcion por defecto
          estadoparametro.Estado={"Id": 1,"NombreEstado": "Activo"};
          this.parametroForm.patchValue(estadoparametro);
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
