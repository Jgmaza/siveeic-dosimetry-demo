import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';


import { OperadorService } from '../../../@core/data/services/operador.service';
import { OperadorView } from '../../../@core/data/models/operador/operador_view';
import { Operador } from '../../../@core/data/models/operador/operador';
import { TipoIdentificacion } from './../../../@core/data/models/tipo_identificacion';
import { TipoOperador } from '../../../@core/data/models/operador/tipo_operador';
import { TipoEstado } from './../../../@core/data/models/tipo_estado';


@Component({
  selector: 'app-todo-form',
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.scss']
})
export class TodoFormComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  
  createMode: boolean = true;
  registro: OperadorView;
  registroForm: FormGroup;
  /*variables para definir los selects de formulario */
  Tipoidentificacion = [];
  Tipooperador = [];
  Estadooperador = [];
  /* */
  registro_id: number;
  /*variables para comparar con lo rescatado y seleccionar la opcion */
  selected_Tipoidentificacion: TipoIdentificacion;
  selected_Tipooperador: TipoOperador;
  selected_Tipoestado: TipoEstado;
  

  @Output() eventChange = new EventEmitter();

  info_operador: Operador;
  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      public activeModal: NgbActiveModal,
      private registroService: OperadorService,
      private toasterService: ToasterService
  ) {

  this.construirForm();
  this.loadOptionsTipoidentificacion();
  this.loadOptionsTipooperador();
  this.loadOptionsEstadooperador();
 }

 construirForm() {
  this.registroForm = this.formBuilder.group({
    Tipoidentificacion: [null, Validators.required],
    Nroidentificacion: ['',  Validators.compose([ Validators.required,Validators.minLength(4),Validators.maxLength(15), Validators.pattern('^[A-Za-z0-9-]+')]) ],
    Nombres: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(100) ]) ],
    Tipooperador: [null, Validators.required ],
    Indicativo: ['',  Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(5), Validators.pattern('^[0-9]*$')]) ],
    Telefonofijo: ['',  Validators.compose([ Validators.required,Validators.minLength(7),Validators.maxLength(20), Validators.pattern('^[0-9 (?:|ext\.?|extension)]*$')]) ],
    Celular: ['',  Validators.compose([ Validators.required,Validators.minLength(10),Validators.maxLength(15), Validators.pattern('^[0-9]*$')]) ],
    Correo: ['',  Validators.compose([ Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-z]+$') ]) ],
    Estadooperador: [null, Validators.required],
  });
}

  ngOnInit() {
    //carga los datos rescatados
    if (!this.createMode) {
      this.loadRegistro(this.registro_id); 
    }
  }

  loadRegistro(registro_id){
    let registro_info: Operador;
    this.registroService.get('operador/' + registro_id)
    .subscribe(res => {
      if (res !== null) {
        registro_info = <Operador>res;
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
        let registro: Operador = this.registroForm.value;
        if (this.createMode){
          //let registro: Operador = this.registroForm.value;
          //console.info(registro);
          this.registroService.postRegistro('operador', registro)
            .subscribe(res => {
              let resultado = <Operador>res;
              //VERIFICA SI SE REGISTRO EL operador;
              if(resultado === null )
                {
                  this.showToast('error', 'Gestión operador!', 'No fue posible registrar el operador, intente de nuevo');
                  this.eventChange.emit(true);
                }
              else
                { 
                  this.eventChange.emit(true);
                  this.showToast('info', 'Gestión operador', 'Operador registrado exitosamente');
                  this.activeModal.close();
                }
            });
      } else{

        const opt: any = {
          title: 'Gestionar operador',
          text: 'Seguro que desea de actualizar los datos del operador?',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#DD6B55',
          confirmButtonText: 'Si, actualizar!',
          cancelButtonText: "No, cancelar!",
        };
        Swal(opt)
          .then((willDelete) => {
            if (willDelete.value) {
              registro.Id=this.registro_id;
              this.registroService.putRegistro('operador', registro)
                .subscribe(res => {
                      let resultado = <Operador>res;
                      //VERIFICA SI SE REGISTRO EL operador;
                      if(resultado === null )
                      {
                        this.showToast('error', 'Gestión operador!', 'No fue posible actualizar los datos del operador, intente de nuevo');
                        this.eventChange.emit(true);
                      }
                      else
                      { 
                        this.eventChange.emit(true);
                        this.showToast('info', 'Gestión operador', 'Datos de operador actualizados, exitosamente!');
                        this.activeModal.close();
                      }
                });
            }
          });
      }

  }


  loadOptionsTipoidentificacion(): void {
    let tipoidentificacion: Array<any> = [];
    this.registroService.get('tipo_identificacion')
      .subscribe(res => {
        if (res !== null) {
          this.Tipoidentificacion = <Array<TipoIdentificacion>>res;
          //this.selected_Tipoidentificacion ={"Id": 3,"NombreIdentificacion": "CC"};
        }
      });
  }

  loadOptionsTipooperador(): void {
    let tipooperador: Array<any> = [];
    this.registroService.get('tipo_operador')
      .subscribe(res => {
        if (res !== null) {
          this.Tipooperador = <Array<TipoOperador>>res;
        }
      });
  }
  loadOptionsEstadooperador(): void {
    let estadooperador: Array<any> = [];
    this.registroService.get('tipo_estado')
      .subscribe(res => {
        if (res !== null) {
          this.Estadooperador = <Array<TipoEstado>>res;
          this.selected_Tipoestado ={"Id": 1,"NombreEstado": "Activo"};
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
