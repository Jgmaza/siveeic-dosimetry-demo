import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';


import { ContactoService } from '../../../@core/data/services/contacto.service';
import { ContactoView } from '../../../@core/data/models/operador/contacto_view';
import { Contacto } from '../../../@core/data/models/operador/contacto';
import { Operador } from '../../../@core/data/models/operador/operador';
import { TipoIdentificacion } from './../../../@core/data/models/tipo_identificacion';
import { TipoEstado } from './../../../@core/data/models/tipo_estado';


@Component({
  selector: 'app-contacto-form',
  templateUrl: './contacto-form.component.html',
  styleUrls: ['./contacto-form.component.scss']
})
export class ContactoFormComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  uid: number;
  user_operador: number;

  createMode: boolean = true;
  registro: ContactoView;
  contactoForm: FormGroup;
  /*variables para definir los selects de formulario */
  Tipoidentificacion = [];
  Estadocontacto = [];
  Operador = [];
  /* */
  registro_id: number;
  
  @Output() eventChange = new EventEmitter();
  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      public activeModal: NgbActiveModal,
      private registroService: ContactoService,
      private toasterService: ToasterService
  ) {
  this.load_UserData();  
  this.construirForm();
  this.loadOptionsOperador();
  this.loadOptionsTipoidentificacion();
  this.loadOptionsEstadocontacto();
 }

 construirForm() {
  this.contactoForm = this.formBuilder.group({
    Operador: [null, Validators.required],
    Tipoidentificacion: [null, Validators.required],
    Nroidentificacion: ['',  Validators.compose([ Validators.required,Validators.minLength(4),Validators.maxLength(15), Validators.pattern('^[A-Za-z0-9-]+')]) ],
    Nombres: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(100) ]) ],
    Apellidos: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(100) ]) ],
    Cargo: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(100) ]) ],
    Correo: ['',  Validators.compose([ Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.[a-z]+\.[a-z]+$') ]) ],
    Indicativo: ['',  Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(5), Validators.pattern('^[0-9]*$')]) ],
    Telefonofijo: ['',  Validators.compose([ Validators.required,Validators.minLength(7),Validators.maxLength(20), Validators.pattern('^[0-9 (?:|ext\.?|extension)]*$')]) ],
    //Celular: ['',  Validators.compose([ Validators.required,Validators.minLength(10),Validators.maxLength(15), Validators.pattern('^[0-9]*$')]) ],
    Celular: ['',  Validators.compose([Validators.minLength(10),Validators.maxLength(15), Validators.pattern('^[0-9]*$')]) ],
    Estadocontacto: [null, Validators.required],
  });
}

  ngOnInit() {
    //carga los datos rescatados
    if (!this.createMode) {
      this.loadRegistro(this.registro_id); 
    }
  }

  load_UserData(): void {
    // rescata el idoperador asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
        //this.uid = user.id;
        this.user_operador = user.operador;
    });
  }

  loadRegistro(registro_id){
    let registro_info: Contacto;
    this.registroService.get('contactoop/' + registro_id)
    .subscribe(res => {
      if (res !== null) {
        registro_info = <Contacto>res;
        this.contactoForm.patchValue(registro_info[0]);  
      }
    });
  }

    /*
    ### funcion para comparar y seleccionar la opcion, se coloca los siguiente en select de html
    ###  [compareWith]="compareById"
    */
    compareById(o1,o2){
      if(o1 == null || o2 == null){
        return false;
      }
      return o1.Id === o2.Id;
    }

  saveRegistro() {
      if (this.contactoForm.invalid) {
        return;
      }
        let registro: Contacto = this.contactoForm.value;
        if (this.createMode){
          //let registro: Operador = this.registroForm.value;

           //verifica si el reporte ya existe
           this.registroService.get('contactoop/0/'+this.user_operador+'/0/'+registro.Nroidentificacion)
           .subscribe(res => {
             
             if (Object.keys(res).length>0) {
                 this.showToast('error', 'Gestión contacto!', 'Ya existe un contacto con el número de identificación '+registro.Nroidentificacion);
                 this.eventChange.emit(true);
               }
             else
               {
                  this.registroService.postRegistro('contactoop', registro)
                  .subscribe(res => {
                    let resultado = <Contacto>res;
                    //VERIFICA SI SE REGISTRO EL operador;
                    if(resultado === null )
                      {
                        this.showToast('error', 'Gestión contacto!', 'No fue posible registrar el contacto, intente de nuevo');
                        this.eventChange.emit(true);
                      }
                    else
                      { 
                        this.eventChange.emit(true);
                        this.showToast('info', 'Gestión contacto', 'Contacto registrado exitosamente');
                        this.activeModal.close();
                      }
                  });
               }
           });
          
      } else{

        const opt: any = {
          title: 'Gestionar operador',
          text: 'Seguro que desea de actualizar los datos de contacto del operador?',
          // 'success' | 'error' | 'warning' | 'info' | 'question'
          type: 'question',
          showCancelButton: true,
          confirmButtonColor: '#6f8ec7',//'#DD6B55',
          confirmButtonText: 'Si, actualizar!',
          cancelButtonText: "No, cancelar!",
        };
        Swal(opt)
          .then((willDelete) => {
            if (willDelete.value) {
              registro.Id=this.registro_id;
              this.registroService.putRegistro('contactoop', registro)
                .subscribe(res => {
                      let resultado = <Contacto>res;
                      //VERIFICA SI SE REGISTRO EL operador;
                      if(resultado === null )
                      {
                        this.showToast('error', 'Gestión contacto!', 'No fue posible actualizar los datos del contacto, intente de nuevo');
                        this.eventChange.emit(true);
                      }
                      else
                      { 
                        this.eventChange.emit(true);
                        this.showToast('info', 'Gestión contacto', 'Datos de contacto actualizados, exitosamente!');
                        this.activeModal.close();
                      }
                });
            }
          });
      }

  }

  loadOptionsOperador(): void {
    let operador: any = Operador;
    this.registroService.get('operador/'+this.user_operador)
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          this.Operador = <Array<Operador>>res;
          if(this.user_operador!==0)
            {//this.selected_Operador = this.Operador[0];
                      //se selleciona la opcion por defecto
              operador.Operador=this.Operador[0];
              this.contactoForm.patchValue(operador);
            
            }
        }
      });
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


  loadOptionsEstadocontacto(): void {
    let estadocontacto: any=TipoEstado;
    this.registroService.get('tipo_estado')
      .subscribe(res => {
        if (res !== null) {
          this.Estadocontacto = <Array<TipoEstado>>res;
          //se selleciona la opcion por defecto
          estadocontacto.Estadocontacto={"Id": 1,"NombreEstado": "Activo"};
          this.contactoForm.patchValue(estadocontacto);
        }
      });
  }

 
  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
      positionClass: 'toast-top-center',
      timeout: 30000,  // ms
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
