import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

import { ConsentimientoService } from '../../@core/data/services/consentimiento.service';
import { Consentimiento } from '../../@core/data/models/consentimiento';
import { Operador } from '../../@core/data/models/operador/operador';


@Component({
  selector: 'app-consentimiento-form',
  templateUrl: './consentimiento-form.component.html',
  styleUrls: ['./consentimiento-form.component.scss']
})
export class ConsentimientoFormComponent implements OnInit {
  config: ToasterConfig;
  settings: any;

  uid: number;
  user_operador: number;
  
  createMode: boolean = true;
  registro: Consentimiento;
  registroForm: FormGroup;
  /*variables para definir los selects de formulario */
  Operador = [];
  /* */
  registro_id: number;
  

  @Output() eventChange = new EventEmitter();

  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      public activeModal: NgbActiveModal,
      private registroService: ConsentimientoService,
      private toasterService: ToasterService
  ) {

  this.load_UserData();
          
  this.construirForm();
  this.loadOptionsOperador();

 }

 construirForm() {
  this.registroForm = this.formBuilder.group({
    Operador: [null, Validators.required],
    Autoriza: [false,Validators.requiredTrue ],
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
        this.registroForm.patchValue(registro_info);  
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
        let registro = this.registroForm.value;
        registro.Usuarioautoriza = this.uid;
        //let data: Medidores = registro;
        let data = registro;
        

        //se guarda el reporte
        this.registroService.postRegistro('consentimiento', data)
        .subscribe(res => {
          let resultado = <Consentimiento>res;
          //VERIFICA SI SE REGISTRO EL operador;
          if(resultado === null )
            {
              this.showToast('error', 'Uso', 'No fue posible realizar el registro, intente de nuevo');
              this.eventChange.emit(true);
            }
          else
            { 
              this.eventChange.emit(true);
              this.showToast('info', 'Uso', 'Registro exitoso');
              this.activeModal.close();
            }
        });

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
              this.registroForm.patchValue(operador);
            }
        }
      });
  }  

  
 
  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
      positionClass: 'toast-top-center',
      timeout: 90000,  // ms
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
