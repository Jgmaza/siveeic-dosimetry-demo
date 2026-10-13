import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

import { GrupoService } from '../../../@core/data/services/grupo_menu.service';
import { GrupoView } from '../../../@core/data/models/menu/grupo_view';
import { Grupo } from '../../../@core/data/models/menu/grupo';
import { TipoEstado } from '../../../@core/data/models/tipo_estado';


@Component({
  selector: 'app-grupo-form',
  templateUrl: './grupo-form.component.html',
  styleUrls: ['./grupo-form.component.scss']
})
export class GrupoFormComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  user_operador: any;
  createMode: boolean = true;
  registro: GrupoView;
  grupoForm: FormGroup;
  /*variables para definir los selects de formulario */

  Grupopadre = [];
  Estado = [];
  /* */
  registro_id: number;
  data_grupo: any;

  @Output() eventChange = new EventEmitter();

  info_grupo: Grupo;
  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      public activeModal: NgbActiveModal,
      private registroService: GrupoService,
      private toasterService: ToasterService
  ) {
  
  this.load_UserData();
  this.construirForm();
  this.loadOptionsGrupomenu();
  this.loadOptionsEstadogrupo();

 }

 construirForm() {

  this.grupoForm = this.formBuilder.group({
    Grupopadre: [''],
    Estado: [null, Validators.required],
    Nombre: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(100) ]) ],
    Titulo: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(25) ]) ],
    Key: ['',  Validators.compose([ Validators.required,Validators.minLength(3),Validators.maxLength(50) ]) ],
    Posicion: ['',  Validators.compose([ Validators.minLength(1),Validators.maxLength(5), Validators.pattern('^[0-9.]*$')]) ],
    Icono: ['',  Validators.compose([Validators.minLength(3),Validators.maxLength(100),Validators.pattern('^[a-zA-Z-_ ]+$') ], ) ],

  });
}

  ngOnInit() {
    //carga los datos rescatados
    if (!this.createMode) {
      this.loadRegistro(this.registro_id); 
    }
  }

  load_UserData(): void {
    // rescata el idgrupo asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
        this.user_operador = user;
    });
   // console.info(this.user_operador);
  } 



  loadRegistro(registro_id){
    let registro_info: Grupo;
    this.registroService.get('grupomenu/' + registro_id)
    .subscribe(res => {
      if (res !== null) {
        registro_info = <Grupo>res;
        // console.info(registro_info);
        this.data_grupo=registro_info[0];  
        this.data_grupo.Titulo=registro_info[0].Datos_grupo.title;
        this.data_grupo.Icono=registro_info[0].Datos_grupo.icon;
        this.data_grupo.Key=registro_info[0].Datos_grupo.key;
        this.grupoForm.patchValue(this.data_grupo);  
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
      if (this.grupoForm.invalid) {
        return;
      }
        let registro: Grupo = this.grupoForm.value;
        if (this.createMode){
          //let registro: Grupo = this.grupoForm.value;
          //console.info(registro);
          this.registroService.postRegistro('grupomenu', registro)
            .subscribe(res => {
              let resultado = <Grupo>res;
              //VERIFICA SI SE REGISTRO EL grupo;
              if(resultado === null )
                {
                  this.showToast('error', 'Gestión grupo!', 'No fue posible registrar el grupo, intente de nuevo');
                  this.eventChange.emit(true);
                }
              else
                { 
                  this.eventChange.emit(true);
                  this.showToast('info', 'Gestión grupo', 'Grupo registrado exitosamente');
                  this.activeModal.close();
                }
            });
      } else{

        const opt: any = {
          title: 'Gestionar grupo',
          text: 'Seguro que desea de actualizar los datos del grupo?',
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
              this.registroService.putRegistro('grupomenu', registro)
                .subscribe(res => {
                      let resultado = <Grupo>res;
                      //VERIFICA SI SE REGISTRO EL grupo;
                      if(resultado === null )
                      {
                        this.showToast('error', 'Gestión grupo!', 'No fue posible actualizar los datos del grupo, intente de nuevo');
                        this.eventChange.emit(true);
                      }
                      else
                      { 
                        this.eventChange.emit(true);
                        this.showToast('info', 'Gestión grupo', 'Datos de grupo actualizados, exitosamente!');
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
          this.Grupopadre = <Array<Grupo>>res;
        }
      });
  }


  loadOptionsEstadogrupo(): void {
    let estadogrupo: any=TipoEstado;
    this.registroService.get('tipo_estado')
      .subscribe(res => {
        if (res !== null) {
          this.Estado = <Array<TipoEstado>>res;
          //se selleciona la opcion por defecto
          estadogrupo.Estado={"Id": 1,"NombreEstado": "Activo"};
          this.grupoForm.patchValue(estadogrupo);
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
