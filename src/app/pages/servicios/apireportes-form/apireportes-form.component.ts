import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

import { ApireporteService } from '../../../@core/data/services/apireportes.service';
import { ApireporteView } from '../../../@core/data/models/apireportes/apireportes_view';
import { Apireporte } from '../../../@core/data/models/apireportes/apireportes';
import { TipoEstado } from '../../../@core/data/models/tipo_estado';


@Component({
  selector: 'app-apireportes-form',
  templateUrl: './apireportes-form.component.html',
  styleUrls: ['./apireportes-form.component.scss']
})
export class ApireporteFormComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  user_operador: any;
  uid: number;
  createMode: boolean = true;
  duplicateMode: boolean = false;
  registro: ApireporteView;
  registroForm: FormGroup;
  /*variables para definir los selects de formulario */

  Apireportepadre = [];
  Estado = [];
  /* */
  registro_id: number;
  data_apireportes: any;

  @Output() eventChange = new EventEmitter();

  info_apireportes: Apireporte;
  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      public activeModal: NgbActiveModal,
      private registroService: ApireporteService,
      private toasterService: ToasterService
  ) {
  
  this.load_UserData();
  this.construirForm();
  this.loadOptionsEstadoapireportes();

 }

 construirForm() {

  this.registroForm = this.formBuilder.group({
    Estado: [null, Validators.required],Nombre: ['',  Validators.compose([Validators.minLength(3),Validators.maxLength(100),Validators.pattern('^[a-zA-ZáéíóúáéíóúÁÉÍÓÚ0-9_.,-\u00f1\u00d1\\s]+$') ]) ],
    Descripcion: ['',  Validators.compose([Validators.minLength(3),Validators.maxLength(255),Validators.pattern('^[a-zA-ZáéíóúáéíóúÁÉÍÓÚ0-9_.,-\u00f1\u00d1\\s]+$') ]) ],
    Puntoacceso: ['',  Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(50), Validators.pattern('^[a-zA-Z0-9-\\/\\#]+$') ]) ],
    Consultadb: ['',  Validators.compose([Validators.minLength(3),Validators.maxLength(255),Validators.pattern('^[a-zA-ZáéíóúáéíóúÁÉÍÓÚ0-9_.,-\u00f1\u00d1\\(\\)\\"\\s]+$') ]) ],
    Parametros: ['{"parametros": [ {"Nombre": "","Valor": "" },{"Nombre": "", "Valor": "" }]}',  Validators.compose([Validators.minLength(3), Validators.pattern('^[a-zA-ZáéíóúáéíóúÁÉÍÓÚ0-9_.,-\\[\\]\\{\\}\\"\\:\\/\\$\\#\\s]+$') ]) ],
    Tratamiento: ['{"Operaciones": [{"Nombre": "","Operacion": "suma","Campos": []},{"Nombre": "","Operacion": "media","Campos": []},{"Nombre": "","Operacion": "mediana","Campos": []},{"Nombre": "","Operacion": "moda","Campos": []},{"Nombre": "","Operacion": "resta","Campos": []},{"Nombre": "","Operacion": "multiplica","Campos": []},{"Nombre": "","Operacion": "divide","Campos": []}]}',
                  Validators.compose([Validators.minLength(3), Validators.pattern('^[a-zA-ZáéíóúáéíóúÁÉÍÓÚ0-9_.,-\\[\\]\\{\\}\\"\\:\\/\\$\\#\\s]+$') ]) ],
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
    let registro_info: Apireporte;
    this.registroService.get('apireportes/' + registro_id)
    .subscribe(res => {
      if (res !== null) {
        registro_info = <Apireporte>res;
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
        let registro: Apireporte = this.registroForm.value;
        registro.Usuarioreporta = this.uid;

        if (this.createMode){
            this.registroService.get('apireportes/0/'+registro.Puntoacceso).subscribe(check => {
              if (Object.keys(check).length>0){ 
                    //this.showToast('warning', 'Gestión estaciones', 'Ya existe una estaciones conNo fue posible registrar la estaciones, intente de nuevo');
                    const opt: any = {
                      title: 'Gestionar servicios web',
                      text: `Ya existe un servicio en la Servicio con punto de acceso "${registro.Puntoacceso}"  `,
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
                      this.registroService.postRegistro('apireportes', registro).subscribe(res => {
                        let resultado = <any>res;
                        //VERIFICA SI SE REGISTRO EL estaciones;
                        if(resultado === null )
                          {
                            this.showToast('warning', 'Gestión api para reportes!', 'No fue posible registrar el servicios api,  intente de nuevo');
                            this.activeModal.close();
                          }
                        else
                          { 
                            this.eventChange.emit(true);
                            this.showToast('success', 'Gestión api para reportes', 'Servicio api registrado exitosamente');
                            this.activeModal.close();
                          }
                      });
                  }
            });
      } else{

        const opt: any = {
          title: 'Gestionar api para reportes',
          text: 'Seguro que desea de actualizar los datos del api para reportes?',
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
                this.registroService.get('apireportes/0/'+registro.Puntoacceso).subscribe(check => {
                  const data = <Array<Apireporte>>check;
                  if (data[0] && data[0].Id!==this.registro_id){ 
                        //this.showToast('warning', 'Gestión estaciones', 'Ya existe una estaciones conNo fue posible registrar la estaciones, intente de nuevo');
                        const opt: any = {
                          title: 'Gestionar api para reportes',
                          text: `Ya existe un servicio web con punto de acceso "${registro.Puntoacceso}" `,
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
                          this.registroService.putRegistro('apireportes', registro).subscribe(res => {
                            let resultado = <any>res;
                            //VERIFICA SI SE REGISTRO EL estaciones;
                            if(resultado === null )
                              {
                                this.showToast('warning', 'Gestión api para reportes', 'No fue posible actualizar el servicio web, intente de nuevo');
                                this.activeModal.close();
                              }
                            else
                              { 
                                this.eventChange.emit(true);
                                this.showToast('success', 'Gestión api para reportes', 'Tervicio web EDA actualizado exitosamente');
                                this.activeModal.close();
                              }
                          });
                      }
                });
            }
          });
      }
  }

  loadOptionsEstadoapireportes(): void {
    let estadoapireportes: any=TipoEstado;
    this.registroService.get('tipo_estado')
      .subscribe(res => {
        if (res !== null) {
          this.Estado = <Array<TipoEstado>>res;
          //se selleciona la opcion por defecto
          estadoapireportes.Estado={"Id": 1,"NombreEstado": "Activo"};
          this.registroForm.patchValue(estadoapireportes);
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
