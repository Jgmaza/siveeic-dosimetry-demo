import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

import { ServiciowebService } from '../../../@core/data/services/servicioweb.service';
import { ServiciowebView } from '../../../@core/data/models/serviciosweb/serviciosweb_view';
import { Servicioweb } from '../../../@core/data/models/serviciosweb/serviciosweb';
import { TipoEstado } from '../../../@core/data/models/tipo_estado';


@Component({
  selector: 'app-serviciosweb-form',
  templateUrl: './serviciosweb-form.component.html',
  styleUrls: ['./serviciosweb-form.component.scss']
})
export class ServiciowebFormComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  user_operador: any;
  uid: number;
  createMode: boolean = true;
  duplicateMode: boolean = false;
  registro: ServiciowebView;
  registroForm: FormGroup;
  /*variables para definir los selects de formulario */

  Serviciowebpadre = [];
  Estado = [];
  /* */
  registro_id: number;
  data_serviciosweb: any;

  @Output() eventChange = new EventEmitter();

  info_serviciosweb: Servicioweb;
  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      public activeModal: NgbActiveModal,
      private registroService: ServiciowebService,
      private toasterService: ToasterService
  ) {
  
  this.load_UserData();
  this.construirForm();
  this.loadOptionsEstadoserviciosweb();

 }

 construirForm() {

  this.registroForm = this.formBuilder.group({
    Estado: [null, Validators.required],
    Nombre: ['',  Validators.compose([Validators.minLength(3),Validators.maxLength(100),Validators.pattern('^[a-zA-ZáéíóúáéíóúÁÉÍÓÚ0-9_.,-\u00f1\u00d1\\s]+$') ]) ],
    Servidor: ['',  Validators.compose([Validators.required,Validators.pattern('^(http[s]?)+\:\//[a-zA-Z0-9._\/-\\:\\/\\#]+$') ]) ],
    Parametros: ['{"pagina": "/|page|" ,"parametro1":{"variable": "var1|","valor":"$vr1|"}, "parametro2":{"variable": "","valor":""}}',  Validators.compose([Validators.minLength(3), Validators.pattern('^[a-zA-ZáéíóúáéíóúÁÉÍÓÚ0-9_.,-\\[\\]\\{\\}\\"\\:\\/\\$\\#\\s]+$') ]) ],
    Peticion: ['{"req":"GET|POST", "app":""}',  Validators.compose([Validators.minLength(3), Validators.pattern('^[a-zA-ZáéíóúáéíóúÁÉÍÓÚ0-9_.,-\\[\\]\\{\\}\\"\\:\\/\\#\\s]+$') ]) ],
    Uso: ['{"servicio":"name-serv", "crond":"no", "hora":"0 0 21 * * *"}',  Validators.compose([Validators.minLength(3), Validators.pattern('^[a-zA-ZáéíóúáéíóúÁÉÍÓÚ0-9_.,-\\[\\]\\{\\}\\"\\:\\*\\/\\#\\s]+$') ]) ],
    Abreviatura: ['',  Validators.compose([Validators.minLength(3),Validators.maxLength(255),Validators.pattern('^[a-zA-ZáéíóúáéíóúÁÉÍÓÚ0-9_.,-\u00f1\u00d1\\s]+$') ]) ],
    //Correo: ['',  Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.[a-z]+\.[a-z]+$') ]) ],
  });
}

  ngOnInit() {
    //carga los datos rescatados

    if (!this.createMode) {
      this.loadRegistro(this.registro_id); 
    }
    if (this.duplicateMode && this.createMode) {
        this.loadRegistro(this.registro_id); 
    }
    
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
    let registro_info: Servicioweb;
    this.registroService.get('servicioweb/' + registro_id)
    .subscribe(res => {
      if (res !== null) {
        registro_info = <Servicioweb>res;
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
        let registro: Servicioweb = this.registroForm.value;
        let Puntoacceso = JSON.parse(registro.Peticion);
        registro.Usuarioreporta = this.uid;

        if (this.createMode){
            this.registroService.get('servicioweb/0/'+Puntoacceso.app).subscribe(check => {
              if (Object.keys(check).length>0){ 
                    //this.showToast('warning', 'Gestión estaciones', 'Ya existe una estaciones conNo fue posible registrar la estaciones, intente de nuevo');
                    const opt: any = {
                      title: 'Gestionar servicios web',
                      text: `Ya existe un servicio en la Petición con punto de acceso "{app:${Puntoacceso.app}}"  `,
                      type:  'error', //['warning','error', 'success']
                      showCancelButton: false,
                      confirmButtonColor: '#6f8ec7',//'#DD6B55',
                      confirmButtonText: 'Aceptar!',
                      //cancelButtonText: "No, cancelar!",
                    };
                    Swal(opt)
                      .then((willDelete) => {});
                  }
              else {
                      this.registroService.postRegistro('servicioweb', registro).subscribe(res => {
                        let resultado = <any>res;
                        //VERIFICA SI SE REGISTRO EL estaciones;
                        if(resultado === null )
                          {
                            this.showToast('warning', 'Gestión servicios web!', 'No fue posible registrar el servicio web, intente de nuevo');
                            this.activeModal.close();
                          }
                        else
                          { 
                            this.eventChange.emit(true);
                            this.showToast('success', 'Gestión servicios web', 'Tervicio web registrado exitosamente');
                            this.activeModal.close();
                          }
                      });
                  }
            });
      } else{

        const opt: any = {
          title: 'Gestionar serviciosweb',
          text: 'Seguro que desea de actualizar los datos del servicios web?',
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
                this.registroService.get('servicioweb/0/'+Puntoacceso.app).subscribe(check => {
                  const data = <Array<Servicioweb>>check;
                  if (data[0] && data[0].Id!==this.registro_id){ 
                        //this.showToast('warning', 'Gestión estaciones', 'Ya existe una estaciones conNo fue posible registrar la estaciones, intente de nuevo');
                        const opt: any = {
                          title: 'Gestionar servicios web',
                          text: `Ya existe un servicio web con punto de acceso "app: ${Puntoacceso.app}" `,
                          type:  'error', //['warning','error', 'success']
                          showCancelButton: false,
                          confirmButtonColor: '#6f8ec7',//'#DD6B55',
                          confirmButtonText: 'Aceptar!',
                          //cancelButtonText: "No, cancelar!",
                        };
                        Swal(opt)
                          .then((willDelete) => {});
                      }
                  else {
                          this.registroService.putRegistro('servicioweb', registro).subscribe(res => {
                            let resultado = <any>res;
                            //VERIFICA SI SE REGISTRO EL estaciones;
                            if(resultado === null )
                              {
                                this.showToast('warning', 'Gestión servicios web', 'No fue posible actualizar el servicio web, intente de nuevo');
                                this.activeModal.close();
                              }
                            else
                              { 
                                this.eventChange.emit(true);
                                this.showToast('success', 'Gestión servicios web', 'Tervicio web EDA actualizado exitosamente');
                                this.activeModal.close();
                              }
                          });
                      }
                });
            }
          });
      }

  }


  loadOptionsEstadoserviciosweb(): void {
    let estadoserviciosweb: any=TipoEstado;
    this.registroService.get('tipo_estado')
      .subscribe(res => {
        if (res !== null) {
          this.Estado = <Array<TipoEstado>>res;
          //se selleciona la opcion por defecto
          estadoserviciosweb.Estado={"Id": 1,"NombreEstado": "Activo"};
          this.registroForm.patchValue(estadoserviciosweb);
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
