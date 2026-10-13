import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

import { MedidoresService } from '../../../@core/data/services/medidores-ami.service';
import { MedidoresView } from '../../../@core/data/models/medidores-ami/medidores-ami_view';
import { Medidores } from '../../../@core/data/models/medidores-ami/medidores-ami';
import { Operador } from '../../../@core/data/models/operador/operador';
import { Departamento } from './../../../@core/data/models/departamento';
import { Municipio } from './../../../@core/data/models/municipio';
import { Periodo } from '../../../@core/data/models/general/periodo';
import { TipoEstado } from './../../../@core/data/models/tipo_estado';


@Component({
  selector: 'app-medidores-form',
  templateUrl: './medidores-form.component.html',
  styleUrls: ['./medidores-form.component.scss']
})
export class MedidoresFormComponent implements OnInit {
  config: ToasterConfig;
  settings: any;
  
  uid: number;
  user_operador: number;
  
  createMode: boolean = true;
  registro: MedidoresView;
  registroForm: FormGroup;
  /*variables para definir los selects de formulario */
  Operador = [];
  Periodo = [];
  Departamento = [];
  Municipio = [];
  /* */
  registro_id: number;
  /*variables para comparar con lo rescatado y seleccionar la opcion */
  selected_Operador: Operador;
  selected_Periodo: Periodo;
  selected_Departamento: Departamento;
  selected_Municipio: Municipio;
  

  @Output() eventChange = new EventEmitter();

  info_medidor: Medidores;
  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      public activeModal: NgbActiveModal,
      private registroService: MedidoresService,
      private toasterService: ToasterService
  ) {

  this.load_UserData();
          
  this.construirForm();
  this.loadOptionsOperador();
  this.loadOptionsPeriodo();
  this.loadOptionsDepartamento();
  //this.loadOptionsMunicipio();
  
  //this.loadOptionsEstadooperador();
 }

 construirForm() {
  this.registroForm = this.formBuilder.group({
    Operador: [null, Validators.required],
    Periodo: [null, Validators.required],
    Departamento: [null, Validators.required],
    Municipio: [{ value: "", disabled: true }, Validators.required],
    MedConvEst1_1_1: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedConvEst2_1_2: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedConvEst3_1_3: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedConvEst4_1_4: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedConvEst5_1_5: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedConvEst6_1_6: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedConvCom_1_7: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedConvInd_1_8: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedConvOfc_1_9: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedConvOtr_1_10: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],

    MedPrepEst1_2_1: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPrepEst2_2_2: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPrepEst3_2_3: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPrepEst4_2_4: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPrepEst5_2_5: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPrepEst6_2_6: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPrepCom_2_7: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPrepInd_2_8: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPrepOfc_2_9: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPrepOtr_2_10: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    
    MedAvanEst1_3_1: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedAvanEst2_3_2: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedAvanEst3_3_3: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedAvanEst4_3_4: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedAvanEst5_3_5: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedAvanEst6_3_6: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedAvanCom_3_7: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedAvanInd_3_8: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedAvanOfc_3_9: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedAvanOtr_3_10: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    
    MedFoptEst1_4_1: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedFoptEst2_4_2: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedFoptEst3_4_3: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedFoptEst4_4_4: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedFoptEst5_4_5: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedFoptEst6_4_6: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedFoptCom_4_7: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedFoptInd_4_8: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedFoptOfc_4_9: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedFoptOtr_4_10: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    
    MedPLCEst1_5_1: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPLCEst2_5_2: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPLCEst3_5_3: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPLCEst4_5_4: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPLCEst5_5_5: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPLCEst6_5_6: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPLCCom_5_7: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPLCInd_5_8: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPLCOfc_5_9: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedPLCOtr_5_10: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    
    MedRFEst1_6_1: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedRFEst2_6_2: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedRFEst3_6_3: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedRFEst4_6_4: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedRFEst5_6_5: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedRFEst6_6_6: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedRFCom_6_7: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedRFInd_6_8: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedRFOfc_6_9: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedRFOtr_6_10: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    
    MedGPRSEst1_7_1: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedGPRSEst2_7_2: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedGPRSEst3_7_3: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedGPRSEst4_7_4: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedGPRSEst5_7_5: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedGPRSEst6_7_6: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedGPRSCom_7_7: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedGPRSInd_7_8: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedGPRSOfc_7_9: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedGPRSOtr_7_10: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    
    MedLPWANEst1_8_1: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedLPWANEst2_8_2: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedLPWANEst3_8_3: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedLPWANEst4_8_4: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedLPWANEst5_8_5: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedLPWANEst6_8_6: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedLPWANCom_8_7: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedLPWANInd_8_8: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedLPWANOfc_8_9: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedLPWANOtr_8_10: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    
    MedOtroEst1_9_1: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedOtroEst2_9_2: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedOtroEst3_9_3: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedOtroEst4_9_4: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedOtroEst5_9_5: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedOtroEst6_9_6: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedOtroCom_9_7: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedOtroInd_9_8: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedOtroOfc_9_9: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    MedOtroOtr_9_10: ["0" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(8), Validators.pattern('^[0-9]*$')]) ],
    Observacion: ['',  Validators.compose([Validators.minLength(3),Validators.maxLength(300), Validators.pattern('^[a-zA-ZáéíóúáéíóúÁÉÍÓÚ0-9_.,-\\/\\#\\s]+$') ]) ],

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
        registro.Usuarioreporta = this.uid;
        let data: Medidores = registro;
        
        
        if (this.createMode){
          //let registro: Operador = this.registroForm.value;



          const opt: any = {
            title: 'Gestión reporte AMI',
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
                this.registroService.get('reporteami/0/'+parseInt(registro.Operador.Id,10)+'/'+registro.Periodo.Id+'/'+registro.Departamento.Id+'/'+registro.Municipio.Id)
                .subscribe(res => {
                  
                  if (Object.keys(res).length>0) {
                      this.showToast('error', 'Gestión reporte AMI!', 'El reporte ya existe para el périodo, departamento y municipio de comercialización.<br>Verifique los datos e intente de nuevo');
                      this.eventChange.emit(true);
                    }
                  else
                    {
                      //se guarda el reporte
                      this.registroService.postRegistro('reporteami', data)
                      .subscribe(res => {
                        let resultado = <MedidoresView>res;
                        //VERIFICA SI SE REGISTRO EL operador;
                        if(resultado === null )
                          {
                            this.showToast('error', 'Gestión reporte AMI!', 'No fue posible registrar el reporte, intente de nuevo');
                            this.eventChange.emit(true);
                          }
                        else
                          { 
                            this.eventChange.emit(true);
                            this.showToast('info', 'Gestión reporte AMI', 'Reporte registrado exitosamente');
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
