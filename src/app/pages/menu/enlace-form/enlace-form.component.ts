import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

import { EnlaceService } from '../../../@core/data/services/enlace.service';
import { EnlaceView } from '../../../@core/data/models/menu/enlace_view';
import { Enlace } from '../../../@core/data/models/menu/enlace';
import { Grupo } from '../../../@core/data/models/menu/grupo';
import { TipoEstado } from '../../../@core/data/models/tipo_estado';


@Component({
  selector: 'app-enlace-form',
  templateUrl: './enlace-form.component.html',
  styleUrls: ['./enlace-form.component.scss']
})
export class EnlaceFormComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  user_operador: any;
  createMode: boolean = true;
  duplicateMode: boolean = false;
  registro: EnlaceView;
  enlaceForm: FormGroup;
  /*variables para definir los selects de formulario */

  Grupo = [];
  Estado = [];
  /* */
  registro_id: number;
  data_enlace: any;

  @Output() eventChange = new EventEmitter();

  info_enlace: Enlace;
  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      public activeModal: NgbActiveModal,
      private registroService: EnlaceService,
      private toasterService: ToasterService
  ) {
  
  this.load_UserData();
  this.construirForm();
  this.loadOptionsGrupomenu();
  this.loadOptionsEstadoenlace();

 }

 construirForm() {

  this.enlaceForm = this.formBuilder.group({
    Grupo: [null, Validators.required],
    Estado: [null, Validators.required],
    Nombre: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(100) ]) ],
    Titulo: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(25) ]) ],
    Key: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(50) ]) ],
    Posicion: ['',  Validators.compose([ Validators.minLength(1),Validators.maxLength(5), Validators.pattern('^[0-9]*$')]) ],
    Enlace: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(100),Validators.pattern('^\/[a-z]+\/[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+\\?*[a-zA-Z0-9-=]+$') ], ) ],

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
    // rescata el idenlace asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
        this.user_operador = user;
    });
   // console.info(this.user_operador);
  } 



  loadRegistro(registro_id){
    let registro_info: Enlace;
    this.registroService.get('enlacemenu/' + registro_id)
    .subscribe(res => {
      if (res !== null) {
        registro_info = <Enlace>res;
        // console.info(registro_info);
        this.data_enlace=registro_info[0];  
        this.data_enlace.Titulo=registro_info[0].Datos_enlace.title;
        this.data_enlace.Enlace=registro_info[0].Datos_enlace.link;
        this.data_enlace.Key=registro_info[0].Datos_enlace.key;
        this.enlaceForm.patchValue(this.data_enlace);  
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
      if (this.enlaceForm.invalid) {
        return;
      }
        let registro: Enlace = this.enlaceForm.value;
        if (this.createMode){
          //let registro: Enlace = this.enlaceForm.value;
          //console.info(registro);
          this.registroService.postRegistro('enlacemenu', registro)
            .subscribe(res => {
              let resultado = <Enlace>res;
              //VERIFICA SI SE REGISTRO EL enlace;
              if(resultado === null )
                {
                  this.showToast('error', 'Gestión enlace!', 'No fue posible registrar el enlace, intente de nuevo');
                  this.eventChange.emit(true);
                }
              else
                { 
                  this.eventChange.emit(true);
                  this.showToast('info', 'Gestión enlace', 'Enlace registrado exitosamente');
                  this.activeModal.close();
                }
            });
      } else{

        const opt: any = {
          title: 'Gestionar enlace',
          text: 'Seguro que desea de actualizar los datos del enlace?',
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
              this.registroService.putRegistro('enlacemenu', registro)
                .subscribe(res => {
                      let resultado = <Enlace>res;
                      //VERIFICA SI SE REGISTRO EL enlace;
                      if(resultado === null )
                      {
                        this.showToast('error', 'Gestión enlace!', 'No fue posible actualizar los datos del enlace, intente de nuevo');
                        this.eventChange.emit(true);
                      }
                      else
                      { 
                        this.eventChange.emit(true);
                        this.showToast('info', 'Gestión enlace', 'Datos de enlace actualizados, exitosamente!');
                        this.activeModal.close();
                      }
                });
            }
          });
      }

  }


  loadOptionsGrupomenu(): void {

    this.registroService.get('grupomenu')
      .subscribe(res => {
        if (res !== null) {
          this.Grupo = <Array<Grupo>>res;
        }
      });
  }


  loadOptionsEstadoenlace(): void {
    let estadoenlace: any=TipoEstado;
    this.registroService.get('tipo_estado')
      .subscribe(res => {
        if (res !== null) {
          this.Estado = <Array<TipoEstado>>res;
          //se selleciona la opcion por defecto
          estadoenlace.Estado={"Id": 1,"NombreEstado": "Activo"};
          this.enlaceForm.patchValue(estadoenlace);
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
