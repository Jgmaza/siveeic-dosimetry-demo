import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

import { RolService } from '../../../@core/data/services/rol.service';
import { RolView } from '../../../@core/data/models/perfil/rol_view';
import { Rol } from '../../../@core/data/models/perfil/rol';
import { TipoEstado } from '../../../@core/data/models/tipo_estado';


@Component({
  selector: 'app-rol-form',
  templateUrl: './rol-form.component.html',
  styleUrls: ['./rol-form.component.scss']
})
export class RolFormComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  user_operador: any;
  createMode: boolean = true;
  registro: RolView;
  rolForm: FormGroup;
  /*variables para definir los selects de formulario */

  Rolpadre = [];
  Estado = [];
  /* */
  registro_id: number;
  data_rol: any;

  @Output() eventChange = new EventEmitter();

  info_rol: Rol;
  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      public activeModal: NgbActiveModal,
      private registroService: RolService,
      private toasterService: ToasterService
  ) {
  
  this.load_UserData();
  this.construirForm();
  this.loadOptionsEstadorol();

 }

 construirForm() {

  this.rolForm = this.formBuilder.group({
    Estado: [null, Validators.required],
    Nombre: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(100) ]) ],
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
    // rescata el idrol asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
        this.user_operador = user;
    });
   // console.info(this.user_operador);
  } 



  loadRegistro(registro_id){
    let registro_info: Rol;
    this.registroService.get('tipo_usuario/' + registro_id)
    .subscribe(res => {
      if (res !== null) {
        let dato = res;
        const reg ={"Nombre":dato[0].NombreTipo, "Descripcion":dato[0].DescTipo, "Estado": dato[0].EstTipo }
        registro_info = <Rol>reg;
        //let datos = {"Nombre":registro_info.}
        this.rolForm.patchValue(registro_info);  
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
      if (this.rolForm.invalid) {
        return;
      }
        let registro: Rol = this.rolForm.value;
        if (this.createMode){
          //let registro: Rol = this.rolForm.value;
          //console.info(registro);
          this.registroService.postRegistro('tipo_usuario', registro)
            .subscribe(res => {
              let resultado = <Rol>res;
              //VERIFICA SI SE REGISTRO EL rol;
              if(resultado === null )
                {
                  this.showToast('error', 'Gestión rol!', 'No fue posible registrar el rol, intente de nuevo');
                  this.eventChange.emit(true);
                }
              else
                { 
                  this.eventChange.emit(true);
                  this.showToast('info', 'Gestión rol', 'Rol registrado exitosamente');
                  this.activeModal.close();
                }
            });
      } else{

        const opt: any = {
          title: 'Gestionar rol',
          text: 'Seguro que desea de actualizar los datos del rol?',
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
              this.registroService.putRegistro('tipo_usuario', registro)
                .subscribe(res => {
                      let resultado = <Rol>res;
                      //VERIFICA SI SE REGISTRO EL rol;
                      if(resultado === null )
                      {
                        this.showToast('error', 'Gestión rol!', 'No fue posible actualizar los datos del rol, intente de nuevo');
                        this.eventChange.emit(true);
                      }
                      else
                      { 
                        this.eventChange.emit(true);
                        this.showToast('info', 'Gestión rol', 'Datos de rol actualizados, exitosamente!');
                        this.activeModal.close();
                      }
                });
            }
          });
      }

  }


  loadOptionsEstadorol(): void {
    let estadorol: any=TipoEstado;
    this.registroService.get('tipo_estado')
      .subscribe(res => {
        if (res !== null) {
          this.Estado = <Array<TipoEstado>>res;
          //se selleciona la opcion por defecto
          estadorol.Estado={"Id": 1,"NombreEstado": "Activo"};
          this.rolForm.patchValue(estadorol);
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
