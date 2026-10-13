import { Component, OnInit, Input, Output, EventEmitter, ViewChild  } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

import { CompartomienergiaService } from '../../../@core/data/services/comparto-mienergia.service';
import { CompartomienergiaView } from '../../../@core/data/models/comparto-mienergia/comparto-mienergia_view';
import { Compartomienergia } from '../../../@core/data/models/comparto-mienergia/comparto-mienergia';
import { Operador } from '../../../@core/data/models/operador/operador';
import { Periodo } from '../../../@core/data/models/comparto-mienergia/periodo';
import { TipoEstado } from './../../../@core/data/models/tipo_estado';
import { CicloFactura } from '../../../@core/data/models/comparto-mienergia/cicloFactura';
import { Servicio } from '../../../@core/data/models/comparto-mienergia/servicioPublico';

import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'app-comparto-mienergia-form',
  templateUrl: './comparto-mienergia-form.component.html',
  styleUrls: ['./comparto-mienergia-form.component.scss']
})
export class CompartomienergiaFormComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  
  uid: number;
  user_operador: number;
  
  createMode: boolean = true;
  registro: CompartomienergiaView;
  registroForm: FormGroup;
  /*variables para definir los selects de formulario */
  Operador = [];
  Periodo = [];
  Ciclo_facturacion = [];
  Servicio_publico = [];
  /* */
  registro_id: number;
  /*variables para comparar con lo rescatado y seleccionar la opcion */
  selected_Operador: Operador;
  selected_Periodo: Periodo;
  
  private myValidatorDate = (ctrl: FormControl): ValidationErrors | null => {
    const myDate = new Date(ctrl.value);
    return !ctrl.value || isNaN(myDate.getTime()) || myDate.getFullYear() > 9999 ? { dateInvalid: true } : null;
  }

  @Output() eventChange = new EventEmitter();

  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;

  info_medidor: Compartomienergia;
  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      public activeModal: NgbActiveModal,
      private registroService: CompartomienergiaService,
      private toasterService: ToasterService
  ) {

  this.load_UserData();
          
  this.construirForm();
  this.loadOptionsOperador();
  this.loadOptionsPeriodo();
  this.loadOptionsCicloFactura();
  this.loadOptionsServicio();
  
 }

construirForm() {
  this.registroForm = this.formBuilder.group({
    Operador: [null, Validators.required],
    Periodo: [null, Validators.required],
    Servicio_publico: [null, Validators.required],
    Total_recaudo: ["" , Validators.compose([ Validators.required,Validators.minLength(1), Validators.pattern('^[0-9.]*$')]) ],
    Fuente_aportes: ['',  Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(100), Validators.pattern('^[a-zA-Z0-9_.,-\\s]+$') ]) ],
    Ciclo_facturacion: [null, Validators.required],
    Cantidad_beneficiarios_estrato1: ["" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    Cantidad_beneficiarios_estrato2: ["" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    Observacion: ['',  Validators.compose([Validators.minLength(3),Validators.maxLength(500), Validators.pattern('^[a-zA-ZáéíóúáéíóúÁÉÍÓÚ0-9_.,-\\/\\#\\s]+$') ]) ],
  });
}

  ngOnInit() {
    //carga los datos rescatados
    if (!this.createMode) {
      this.loadRegistro(this.registro_id); 
    }
  }

  loadRegistro(registro_id){
    let registro_info: Compartomienergia;
    this.registroService.get('reportecompartoenrg/' + registro_id)
    .subscribe(res => {
      if (res !== null) {
        registro_info = <Compartomienergia>res;
       // console.info(registro_info)
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
        registro.Usuarioreporta = this.uid;
        let data: Compartomienergia = registro;
        if (this.createMode){
          //let registro: Operador = this.registroForm.value;

          const opt: any = {
            title: 'Gestión reporte comparto mi energía',
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
               
                //verifica si el reporte ya existe
                this.registroService.get('reportecompartoenrg/0/'+parseInt(registro.Operador.Id,10)+'/'+registro.Periodo.Id+'/'+registro.Servicio_publico.Id+'/')
                .subscribe(res => {
                  if (Object.keys(res).length>0) {
                      this.showToast('error', 'Gestión reporte comparto mi energía!', `El reporte ya existe para el Servicio Público y el périodo.<br>Verifique los datos e intente de nuevo`);
                      this.eventChange.emit(true);
                    }
                  else
                    {
                      //se guarda el reporte
                      this.registroService.postRegistro('reportecompartoenrg', data)
                      .subscribe(res => {
                        let resultado = <CompartomienergiaView>res;
                        //VERIFICA SI SE REGISTRO EL operador;
                        if(resultado === null )
                          {
                            this.showToast('error', 'Gestión reporte comparto mi energía!', 'No fue posible registrar el reporte, intente de nuevo');
                            this.eventChange.emit(true);
                          }
                        else
                          { 
                            this.eventChange.emit(true);
                            this.showToast('info', 'Gestión reporte comparto mi energía', 'Reporte registrado exitosamente');
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
  
  loadOptionsCicloFactura(): void {
    let solucion: Array<any> = [];
    this.registroService.get('ciclofactura')
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          this.Ciclo_facturacion = <Array<CicloFactura>>res;
        }
      });
  }     
  
  loadOptionsServicio(): void {
    let fuente: Array<any> = [];
    this.registroService.get('servicioscomparto')
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          this.Servicio_publico = <Array<Servicio>>res;
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
