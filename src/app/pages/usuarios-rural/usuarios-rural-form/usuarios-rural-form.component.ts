import { Component, OnInit, Input, Output, EventEmitter, ViewChild  } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

import { UsuariosruralService } from '../../../@core/data/services/usuarios-rural.service';
import { UsuariosruralView } from '../../../@core/data/models/usuarios-rural/usuarios-rural_view';
import { Usuariosrural } from '../../../@core/data/models/usuarios-rural/usuarios-rural';
import { Operador } from '../../../@core/data/models/operador/operador';
import { Departamento } from './../../../@core/data/models/departamento';
import { Municipio } from './../../../@core/data/models/municipio';
import { Periodo } from '../../../@core/data/models/usuarios-rural/periodo';
import { TipoEstado } from './../../../@core/data/models/tipo_estado';
import { Solucion } from './../../../@core/data/models/usuarios-rural/solucion';
import { Fuente } from './../../../@core/data/models/usuarios-rural/fuentefinancia';

import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'app-usuarios-rural-form',
  templateUrl: './usuarios-rural-form.component.html',
  styleUrls: ['./usuarios-rural-form.component.scss']
})
export class UsuariosruralFormComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  
  uid: number;
  user_operador: number;
  
  createMode: boolean = true;
  registro: UsuariosruralView;
  registroForm: FormGroup;
  /*variables para definir los selects de formulario */
  Operador = [];
  Periodo = [];
  Departamento = [];
  Municipio = [];
  Tipo_Solucion = [];
  Fuente_Financiacion = [];
  /* */
  registro_id: number;
  /*variables para comparar con lo rescatado y seleccionar la opcion */
  selected_Operador: Operador;
  selected_Periodo: Periodo;
  selected_Departamento: Departamento;
  selected_Municipio: Municipio;
  
  private myValidatorDate = (ctrl: FormControl): ValidationErrors | null => {
    const myDate = new Date(ctrl.value);
    return !ctrl.value || isNaN(myDate.getTime()) || myDate.getFullYear() > 9999 ? { dateInvalid: true } : null;
  }

  @Output() eventChange = new EventEmitter();

  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;

  info_medidor: Usuariosrural;
  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      public activeModal: NgbActiveModal,
      private registroService: UsuariosruralService,
      private toasterService: ToasterService
  ) {

  this.load_UserData();
          
  this.construirForm();
  this.loadOptionsOperador();
  this.loadOptionsPeriodo();
  this.loadOptionsDepartamento();
  this.loadOptionsSolucion();
  this.loadOptionsFuente();
  //this.loadOptionsMunicipio();
  
  //this.loadOptionsEstadooperador();
 }

construirForm() {
  this.registroForm = this.formBuilder.group({
    Operador: [null, Validators.required],
    Periodo: [null, Validators.required],
    Departamento: [null, Validators.required],
    Municipio: [{ value: "", disabled: true }, Validators.required],
    Vereda: ['',  Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(100), Validators.pattern('^[a-zA-Z0-9_.,-\\s]+$') ]) ],
    //Correo: ['',  Validators.compose([ Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-z]+$') ]) ],
    Cantidad_Usuarios: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    Fuente_Financiacion: [null, Validators.required],
    Otra_Fuente: [{ value: "", disabled: true },  Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(255), Validators.pattern('^[a-zA-Z0-9_.,-\\s]+$') ]) ],    
    //Otra_Fuente: [{ value: "", disabled: true }],    
    Tipo_Solucion: [null, Validators.required],
    Fecha_inicio: ['', this.myValidatorDate ],
    Latitud: ["" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(20), Validators.pattern('^[-]*[0-9]+\.[0-9]*$')]) ],
    Longitud: ["" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(20), Validators.pattern('^[-]*[0-9]+\.[0-9]*$')]) ],
    Altitud: ["" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9.]*$')]) ],
  });
}

  ngOnInit() {
    //carga los datos rescatados
    if (!this.createMode) {
      this.loadOptionsMunicipio();
      this.loadRegistro(this.registro_id); 
    }
  }

  loadRegistro(registro_id){
    let registro_info: Usuariosrural;
    this.registroService.get('reporteusrural/' + registro_id)
    .subscribe(res => {
      if (res !== null) {
        registro_info = <Usuariosrural>res;
      //  console.info(registro_info)
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


  selectFuente()
    {   
        let selecion=this.registroForm.get('Fuente_Financiacion').value;
        //console.info(selecion.Nombre)
        if(selecion.Nombre==='Otros')
          { this.registroForm.get('Otra_Fuente').enable();
            this.registroForm.get('Otra_Fuente').setValue('');
          }
        else if(selecion.Nombre!=='Otros')
          { 
          this.registroForm.get('Otra_Fuente').setValue(selecion.Nombre);
            this.registroForm.get('Otra_Fuente').disable();
          }  
     }


  saveRegistro() {
      if (this.registroForm.invalid) {
        return;
      }
        let registro = this.registroForm.value;
        registro.Usuarioreporta = this.uid;
        let data: Usuariosrural = registro;
        if (this.createMode){
          //let registro: Operador = this.registroForm.value;

          const opt: any = {
            title: 'Gestión reporte usuarios rurales',
            text: 'Seguro de guardar el reporte?, Recuerde que una vez se guarde, no se podrán modificar los datos.',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#6f8ec7',//'#DD6B55',
            confirmButtonText: 'Si, Guardar!',
            cancelButtonText: "No, cancelar!",
            //buttons: true,
            //dangerMode: true,
            //showCancelButton: true,
          };
          Swal(opt)
            .then((willDelete) => {
              if (willDelete.value) {
                /*
                  //se guarda el reporte
                  this.registroService.postRegistro('reporteusrural', data)
                  .subscribe(res => {
                    let resultado = <UsuariosruralView>res;
                    //VERIFICA SI SE REGISTRO EL operador;
                    if(resultado === null )
                      {
                        this.showToast('error', 'Gestión reporte usuarios rurales!', 'No fue posible registrar el reporte, intente de nuevo');
                        this.eventChange.emit(true);
                      }
                    else
                      { 
                        this.eventChange.emit(true);
                        this.showToast('info', 'Gestión reporte usuarios rurales', 'Reporte registrado exitosamente');
                        this.activeModal.close();
                      }
                  });*/

                
                //verifica si el reporte ya existe
                this.registroService.get('reporteusrural/0/'+parseInt(registro.Operador.Id,10)+'/'+registro.Periodo.Id+'/'+registro.Departamento.Id+'/'+registro.Municipio.Id+'/'+registro.Vereda)
                .subscribe(res => {
                  if (Object.keys(res).length>0) {
                      this.showToast('error', 'Gestión reporte usuarios rurales!', 'El reporte ya existe para el périodo, departamento y municipio de comercialización.<br>Verifique los datos e intente de nuevo');
                      this.eventChange.emit(true);
                    }
                  else
                    {
                      //se guarda el reporte
                      this.registroService.postRegistro('reporteusrural', data)
                      .subscribe(res => {
                        let resultado = <UsuariosruralView>res;
                        //VERIFICA SI SE REGISTRO EL operador;
                        if(resultado === null )
                          {
                            this.showToast('error', 'Gestión reporte usuarios rurales!', 'No fue posible registrar el reporte, intente de nuevo');
                            this.eventChange.emit(true);
                          }
                        else
                          { 
                            this.eventChange.emit(true);
                            this.showToast('info', 'Gestión reporte usuarios rurales', 'Reporte registrado exitosamente');
                            this.activeModal.close();
                          }
                      });
                    }
                });

              }
            });

      } else{
        /*
        //codigo para editar los registros
        const opt: any = {
          title: 'Gestionar operador',
          text: 'Seguro que desea de actualizar los datos del operador?',
          icon: 'warning',
          buttons: true,
          dangerMode: true,
          showCancelButton: true,
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
          });*/
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

  selectMunicipio()
  {   let selecion=this.registroForm.get('Departamento').value;
      this.registroService.get('municipio/na/'+selecion.Id)
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          this.Municipio = <Array<Municipio>>res;
          //console.log(this.Municipio[0]);
          this.selected_Municipio = this.Municipio[0];
          //this.registroForm.get('Municipio').disable();
          this.registroForm.get('Municipio').enable();
        }
      });
      
  }

  loadOptionsMunicipio(): void {
    let operador: Array<any> = [];
    this.registroService.get('municipio')
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          this.Municipio = <Array<Municipio>>res;
        }
      });
  }    

  loadOptionsPeriodo(): void {
    let periodo: Array<any> = [];
    this.registroService.get('periodo')
      .subscribe(res => {
        if (res !== null) {
         // console.info(res);
          this.Periodo = <Array<Periodo>>res;
        }
      });
  }    
  
  loadOptionsSolucion(): void {
    let solucion: Array<any> = [];
    this.registroService.get('tiposolucion')
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          this.Tipo_Solucion = <Array<Solucion>>res;
        }
      });
  }     
  
  loadOptionsFuente(): void {
    let fuente: Array<any> = [];
    this.registroService.get('fuentefinancia')
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          this.Fuente_Financiacion = <Array<Fuente>>res;
        }
      });
  } 
 
  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
      positionClass: 'toast-top-center',
      timeout: 60000,  // ms
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
