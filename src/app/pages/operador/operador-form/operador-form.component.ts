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
import { TipoPersona } from '../../../@core/data/models/operador/tipo_persona';
import { TipoEstado } from './../../../@core/data/models/tipo_estado';
import { Departamento } from './../../../@core/data/models/departamento';
import { Municipio } from './../../../@core/data/models/municipio';


@Component({
  selector: 'app-operador-form',
  templateUrl: './operador-form.component.html',
  styleUrls: ['./operador-form.component.scss']
})
export class OperadorFormComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  user_operador: any;
  createMode: boolean = true;
  registro: OperadorView;
  operadorForm: FormGroup;
  /*variables para definir los selects de formulario */
  Tipoidentificacion = [];
  Tipopersona = [];
  Tipooperador = [];
  Estadooperador = [];
  Departamento = [];
  Municipio = [];
  /* */
  registro_id: number;
  data_operador: any;

  @Output() eventChange = new EventEmitter();

  info_operador: Operador;
  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      public activeModal: NgbActiveModal,
      private registroService: OperadorService,
      private toasterService: ToasterService
  ) {
  
  this.load_UserData();
  this.construirForm();
  this.loadOptionsTipoidentificacion();
  this.loadOptionsTipopersona();
  this.loadOptionsTipooperador();
  this.loadOptionsEstadooperador();
  this.loadOptionsDepartamento();
  this.Permisos();
 }

 construirForm() {

  this.operadorForm = this.formBuilder.group({
    Tipoidentificacion: [null, Validators.required],
    Nroidentificacion: ['',  Validators.compose([ Validators.required,Validators.minLength(4),Validators.maxLength(15), Validators.pattern('^[A-Za-z0-9-]+')]) ],
    Nombres: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(100) ]) ],
    Siglas: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(20) ]) ],
    Tipooperador: [null, Validators.required ],
    Tipopersona: [null, Validators.required ],
    Estadooperador: [null, Validators.required],
    Departamento: [null, Validators.required],
    Municipio: [{ value: "", disabled: true }, Validators.required],
    Celular: ['',  Validators.compose([ Validators.minLength(10),Validators.maxLength(15), Validators.pattern('^[0-9]*$')]) ],
    Direccion: ['',  Validators.compose([ Validators.minLength(3),Validators.maxLength(100) ]) ],
    Indicativo: ['',  Validators.compose([ Validators.minLength(1),Validators.maxLength(5), Validators.pattern('^[0-9]*$')]) ],
    Telefonofijo: ['',  Validators.compose([ Validators.minLength(7),Validators.maxLength(20), Validators.pattern('^[0-9 (?:|ext\.?|extension)]*$')]) ],
    Correo: ['',  Validators.compose([ Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.[a-z]+\.[a-z]+$') ]) ],
    Sitio: ['',  Validators.compose([ Validators.pattern('^(http[s]?)+\:\//[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.[a-z]+\.[a-z]+$') ]) ],
  });
}

  ngOnInit() {
    //carga los datos rescatados
    if (!this.createMode) {
      this.loadOptionsMunicipio();
      this.loadRegistro(this.registro_id); 
    }
  }

  load_UserData(): void {
    // rescata el idoperador asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
        this.user_operador = user;
    });
   // console.info(this.user_operador);
  } 

  Permisos()
  {   
    if(this.user_operador.operador !== 0){
      
        this.operadorForm.get('Tipopersona').disable();
        this.operadorForm.get('Tipoidentificacion').disable();
        this.operadorForm.get('Nroidentificacion').disable();
        this.operadorForm.get('Nombres').disable();
        this.operadorForm.get('Siglas').disable();
        this.operadorForm.get('Tipooperador').disable();
        this.operadorForm.get('Estadooperador').disable();
        //adicionar validaroes a campos especificos
        this.operadorForm.controls['Direccion'].setValidators(Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(100)]));
        this.operadorForm.controls['Indicativo'].setValidators(Validators.compose([Validators.required, Validators.minLength(1),Validators.maxLength(5), Validators.pattern('^[0-9]*$')]));
        this.operadorForm.controls['Telefonofijo'].setValidators(Validators.compose([ Validators.required, Validators.minLength(7),Validators.maxLength(20), Validators.pattern('^[0-9 (?:|ext\.?|extension)]*$') ]));
        this.operadorForm.controls['Correo'].setValidators(Validators.compose([ Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-z]+\.[a-z]+$') ]));
        }
      //habilitar el campo
      //this.registroForm.get('Municipio').disable();
      //this.operadorForm.get('Municipio').setValidators
  }

  loadRegistro(registro_id){
    let registro_info: Operador;
    this.registroService.get('operador/' + registro_id)
    .subscribe(res => {
      if (res !== null) {
        registro_info = <Operador>res;
        //console.info(registro_info);
        this.data_operador=registro_info[0];  
        this.operadorForm.patchValue(registro_info[0]);  
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
      if (this.operadorForm.invalid) {
        return;
      }
        let registro: Operador = this.operadorForm.value;
        if (this.createMode){
          //let registro: Operador = this.operadorForm.value;
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
          confirmButtonColor: '#6f8ec7',//'#DD6B55',
          confirmButtonText: 'Si, actualizar!',
          cancelButtonText: "No, cancelar!",
        };
        Swal(opt)
          .then((willDelete) => {
            if (willDelete.value) {
                registro.Id=this.registro_id;
                  //asigna datos basico, operador no puede actualizar
                  if(this.user_operador.operador !== 0){
                    registro.Tipoidentificacion=this.data_operador.Tipoidentificacion;
                    registro.Nroidentificacion=this.data_operador.Nroidentificacion;
                    registro.Nombres=this.data_operador.Nombres;
                    registro.Tipooperador=this.data_operador.Tipooperador;
                    registro.Tipopersona=this.data_operador.Tipopersona;
                    registro.Estadooperador=this.data_operador.Estadooperador;
                  }
                  //console.info(registro);
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
        }
      });
  }
  loadOptionsTipopersona(): void {
    let tipopersona: any=TipoPersona;
    this.registroService.get('tipopersona')
      .subscribe(res => {
        if (res !== null) {
          this.Tipopersona = <Array<TipoPersona>>res;
          //se selleciona la opcion por defecto
          //tipopersonas.Tipopersona={"Id": 7,"Nombre": "Convencional"};
          this.operadorForm.patchValue(tipopersona);
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
    let estadooperador: any=TipoEstado;
    this.registroService.get('tipo_estado')
      .subscribe(res => {
        if (res !== null) {
          this.Estadooperador = <Array<TipoEstado>>res;
          //se selleciona la opcion por defecto
          estadooperador.Estadooperador={"Id": 1,"NombreEstado": "Activo"};
          this.operadorForm.patchValue(estadooperador);
        }

      });
  }


  loadOptionsDepartamento(): void {
    let operador: Array<any> = [];
    this.registroService.get('departamento')
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          this.Departamento = <Array<Departamento>>res;
        }
      });
  }    

  loadOptionsMunicipio(): void {

    this.operadorForm.get('Municipio').enable();

    let operador: Array<any> = [];
    this.registroService.get('municipio')
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          this.Municipio = <Array<Municipio>>res;
        }
      });
  }   
  
  selectMunicipio()
  {   
    let municipio: any=Municipio;
      let selecion=this.operadorForm.get('Departamento').value;
      this.registroService.get('municipio/na/'+selecion.Id)
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          this.Municipio = <Array<Municipio>>res;
          //console.log(this.Municipio[0]);

          //se selleciona la opcion por defecto
          municipio.Municipio=this.Municipio[0];;
          this.operadorForm.patchValue(municipio);

          //this.selected_Municipio = this.Municipio[0];

          //habilitar el campo
          //this.registroForm.get('Municipio').disable();
          this.operadorForm.get('Municipio').enable();
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
