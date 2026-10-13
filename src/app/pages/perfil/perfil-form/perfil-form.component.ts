import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

import { PerfilService } from '../../../@core/data/services/perfil.service';
import { PerfilView } from '../../../@core/data/models/perfil/perfil_view';
import { Perfil } from '../../../@core/data/models/perfil/perfil';
import { Rol } from '../../../@core/data/models/perfil/rol';
import { Enlace } from '../../../@core/data/models/menu/enlace';
import { TipoEstado } from '../../../@core/data/models/tipo_estado';


@Component({
  selector: 'app-perfil-form',
  templateUrl: './perfil-form.component.html',
  styleUrls: ['./perfil-form.component.scss']
})
export class PerfilFormComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  user_operador: any;
  createMode: boolean = true;
  registro: PerfilView;
  perfilForm: FormGroup;
  /*variables para definir los selects de formulario */

  Rol = [];
  Estado = [];
  Enlace = [];
  /* */
  registro_id: number;
  data_perfil: any;

  @Output() eventChange = new EventEmitter();

  info_perfil: Perfil;
  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      public activeModal: NgbActiveModal,
      private registroService: PerfilService,
      private toasterService: ToasterService
  ) {
  
  this.load_UserData();
  this.construirForm();
  this.loadOptionsRolmenu();
  this.loadOptionsEnlacemenu();

  this.loadOptionsEstadoperfil();

 }

 construirForm() {

  this.perfilForm = this.formBuilder.group({
    Rol: [null, Validators.required],
    Enlace: [null, Validators.required],
    Estado: [null, Validators.required],
    Observacion: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(100) ]) ],
    

  });
}

  ngOnInit() {
    //carga los datos rescatados
    if (!this.createMode) {
      this.loadRegistro(this.registro_id); 
    }
  }

  load_UserData(): void {
    // rescata el idperfil asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
        this.user_operador = user;
    });
   // console.info(this.user_operador);
  } 



  loadRegistro(registro_id){
    let registro_info: Perfil;
    this.registroService.get('perfilmenu/' + registro_id)
    .subscribe(res => {
      if (res !== null) {
        registro_info = <Perfil>res;
        // console.info(registro_info);
        this.data_perfil=registro_info[0];  
        this.perfilForm.patchValue(this.data_perfil);  
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
      if (this.perfilForm.invalid) {
        return;
      }
        let registro: Perfil = this.perfilForm.value;
        if (this.createMode){
          //let registro: Perfil = this.perfilForm.value;
          //console.info(registro);
          this.registroService.postRegistro('perfilmenu', registro)
            .subscribe(res => {
              let resultado = <Perfil>res;
              //VERIFICA SI SE REGISTRO EL perfil;
              if(resultado === null )
                {
                  this.showToast('error', 'Gestión perfil!', 'No fue posible registrar el perfil, intente de nuevo');
                  this.eventChange.emit(true);
                }
              else
                { 
                  this.eventChange.emit(true);
                  this.showToast('info', 'Gestión perfil', 'Perfil registrado exitosamente');
                  this.activeModal.close();
                }
            });
      } else{

        const opt: any = {
          title: 'Gestionar perfil',
          text: 'Seguro que desea de actualizar los datos del perfil?',
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
              this.registroService.putRegistro('perfilmenu', registro)
                .subscribe(res => {
                      let resultado = <Perfil>res;
                      //VERIFICA SI SE REGISTRO EL perfil;
                      if(resultado === null )
                      {
                        this.showToast('error', 'Gestión perfil!', 'No fue posible actualizar los datos del perfil, intente de nuevo');
                        this.eventChange.emit(true);
                      }
                      else
                      { 
                        this.eventChange.emit(true);
                        this.showToast('info', 'Gestión perfil', 'Datos de perfil actualizados, exitosamente!');
                        this.activeModal.close();
                      }
                });
            }
          });
      }

  }


  loadOptionsRolmenu(): void {
    this.registroService.get('tipo_usuario')
      .subscribe(res => {
        if (res !== null) {
          this.Rol = <Array<Rol>>res;
        }
      });
  }

  loadOptionsEnlacemenu(): void {
    this.registroService.get('enlacemenu')
      .subscribe(res => {
        if (res !== null) {
          this.Enlace = <Array<Enlace>>res;
        }
      });
  }

  loadOptionsEstadoperfil(): void {
    let estadoperfil: any=TipoEstado;
    this.registroService.get('tipo_estado')
      .subscribe(res => {
        if (res !== null) {
          this.Estado = <Array<TipoEstado>>res;
          //se selleciona la opcion por defecto
          estadoperfil.Estado={"Id": 1,"NombreEstado": "Activo"};
          this.perfilForm.patchValue(estadoperfil);
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
