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
import { MedidoresCsv } from '../../../@core/data/models/medidores-ami/medidores-ami-csv';
import { Operador } from '../../../@core/data/models/operador/operador';
import { Departamento } from './../../../@core/data/models/departamento';
import { Municipio } from './../../../@core/data/models/municipio';
import { Periodo } from '../../../@core/data/models/general/periodo';
import { TipoEstado } from './../../../@core/data/models/tipo_estado';


@Component({
  selector: 'app-medidores-upload',
  templateUrl: './medidores-upload.component.html',
  styleUrls: ['./medidores-upload.component.scss']
})
export class MedidoresUploadComponent implements OnInit {
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
  registro_id: number;
  
  /*variables separacion de archvo*/
  sizeFormatFile=93;
  divFormatFile:any;

  /*variables para lectura de archivo*/  
  uploadedFiles: Array < File > ;
  textFromFileLoaded: any;
  errorTextFile: any;
  errorFormatFile=0;
  TextRecordCsv: any;
  CodDeptoCsv: any;

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
 }

 construirForm() {
  this.registroForm = this.formBuilder.group({
    Operador: [null, Validators.required],
    Periodo: [null, Validators.required],
    Archivo: [null, Validators.required],
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

    //valida los datos, nulo y numerico
    compareByValid(dato){
      let valor: any ;
      if(dato === null || dato === ''){
        valor= "0";
      }
      else if(dato !== null && dato !== '' && dato >= 0 ){
        valor= dato;
      }
      else {
        this.errorTextFile++;
      }
      // console.info(valor)
      // console.info(this.errorTextFile)
      return valor;
    }    


  fileChange(element) {
      let input = element.target; 
      this.textFromFileLoaded = new FileReader();
      this.textFromFileLoaded.readAsText(input.files[0]);  
      // console.info(this.textFromFileLoaded);
    }

  readFileCSV() {
    let csvData = this.textFromFileLoaded.result; 
    let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);  
    let headersRow = this.getHeaderArray(csvRecordsArray);  
    //  console.info(csvRecordsArray)
    //verifica cantidad de columnas del formato
    if(headersRow.length!==this.sizeFormatFile)
        {this.errorFormatFile=1;}
    else{
        //verifica y elabora objeto de datos a cargar
        this.TextRecordCsv = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
    }
  }
  
  getHeaderArray(csvRecordsArr: any) {  
    // se verifica caracter de separación
    let headers = (<string>csvRecordsArr[0]).split(',');  
    if(headers.length===this.sizeFormatFile){
         this.divFormatFile=',';
        }
    else{headers = (<string>csvRecordsArr[0]).split(';'); 
          this.divFormatFile=';'; 
        }
    // console.info('separador '+this.divFormatFile)    
    let headerArray = [];  
    for (let j = 0; j < headers.length; j++) {  
      headerArray.push(headers[j]);  
    }  
    return headerArray;  
  }  

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {  
    let csvArr = [];  
    this.errorTextFile=0;
    for (let i = 1; i < csvRecordsArray.length; i++) {  

      let text:any;
      let RecordRow = (<string>csvRecordsArray[i]);  
      //let curruntRecord = (<string>csvRecordsArray[i]).split(this.divFormatFile);  
      let curruntRecord = RecordRow.split(this.divFormatFile);  
      
      if (csvRecordsArray[i].indexOf('"',90)>0 && curruntRecord.length > headerLength) {  
           text=RecordRow.substring((RecordRow.indexOf('"',90)+1), RecordRow.lastIndexOf('"'));
           curruntRecord.length= headerLength;
        } 
      else if (curruntRecord.length == headerLength){
            text=curruntRecord[92].trim();
           }  

      if (curruntRecord.length == headerLength) {  
        
        let csvRecord: MedidoresCsv = new MedidoresCsv();
        csvRecord.Municipio = this.compareByValid(curruntRecord[1].trim());  
       
        csvRecord.MedConvEst1_1_1 = this.compareByValid(curruntRecord[2].trim());  
        csvRecord.MedConvEst2_1_2 = this.compareByValid(curruntRecord[3].trim());  
        csvRecord.MedConvEst3_1_3 = this.compareByValid(curruntRecord[4].trim());  
        csvRecord.MedConvEst4_1_4 = this.compareByValid(curruntRecord[5].trim());  
        csvRecord.MedConvEst5_1_5 = this.compareByValid(curruntRecord[6].trim());  
        csvRecord.MedConvEst6_1_6 = this.compareByValid(curruntRecord[7].trim());  
        csvRecord.MedConvCom_1_7 = this.compareByValid(curruntRecord[8].trim());  
        csvRecord.MedConvInd_1_8 = this.compareByValid(curruntRecord[9].trim());  
        csvRecord.MedConvOfc_1_9 = this.compareByValid(curruntRecord[10].trim());  
        csvRecord.MedConvOtr_1_10 = this.compareByValid(curruntRecord[11].trim());  
        
        csvRecord.MedPrepEst1_2_1 = this.compareByValid(curruntRecord[12].trim());  
        csvRecord.MedPrepEst2_2_2 = this.compareByValid(curruntRecord[13].trim());  
        csvRecord.MedPrepEst3_2_3 = this.compareByValid(curruntRecord[14].trim());  
        csvRecord.MedPrepEst4_2_4 = this.compareByValid(curruntRecord[15].trim());  
        csvRecord.MedPrepEst5_2_5 = this.compareByValid(curruntRecord[16].trim());  
        csvRecord.MedPrepEst6_2_6 = this.compareByValid(curruntRecord[17].trim());  
        csvRecord.MedPrepCom_2_7 = this.compareByValid(curruntRecord[18].trim());  
        csvRecord.MedPrepInd_2_8 = this.compareByValid(curruntRecord[19].trim());  
        csvRecord.MedPrepOfc_2_9 = this.compareByValid(curruntRecord[20].trim());  
        csvRecord.MedPrepOtr_2_10 = this.compareByValid(curruntRecord[21].trim());  
        
        csvRecord.MedAvanEst1_3_1 = this.compareByValid(curruntRecord[22].trim());  
        csvRecord.MedAvanEst2_3_2 = this.compareByValid(curruntRecord[23].trim());  
        csvRecord.MedAvanEst3_3_3 = this.compareByValid(curruntRecord[24].trim());  
        csvRecord.MedAvanEst4_3_4 = this.compareByValid(curruntRecord[25].trim());  
        csvRecord.MedAvanEst5_3_5 = this.compareByValid(curruntRecord[26].trim());  
        csvRecord.MedAvanEst6_3_6 = this.compareByValid(curruntRecord[27].trim());  
        csvRecord.MedAvanCom_3_7 = this.compareByValid(curruntRecord[28].trim());  
        csvRecord.MedAvanInd_3_8 = this.compareByValid(curruntRecord[29].trim());  
        csvRecord.MedAvanOfc_3_9 = this.compareByValid(curruntRecord[30].trim());  
        csvRecord.MedAvanOtr_3_10 = this.compareByValid(curruntRecord[31].trim());  
        
        csvRecord.MedFoptEst1_4_1 = this.compareByValid(curruntRecord[32].trim());  
        csvRecord.MedFoptEst2_4_2 = this.compareByValid(curruntRecord[33].trim());  
        csvRecord.MedFoptEst3_4_3 = this.compareByValid(curruntRecord[34].trim());  
        csvRecord.MedFoptEst4_4_4 = this.compareByValid(curruntRecord[35].trim());  
        csvRecord.MedFoptEst5_4_5 = this.compareByValid(curruntRecord[36].trim());  
        csvRecord.MedFoptEst6_4_6 = this.compareByValid(curruntRecord[37].trim());  
        csvRecord.MedFoptCom_4_7 = this.compareByValid(curruntRecord[38].trim());  
        csvRecord.MedFoptInd_4_8 = this.compareByValid(curruntRecord[39].trim());  
        csvRecord.MedFoptOfc_4_9 = this.compareByValid(curruntRecord[40].trim());  
        csvRecord.MedFoptOtr_4_10 = this.compareByValid(curruntRecord[41].trim());  
        
        csvRecord.MedPLCEst1_5_1 = this.compareByValid(curruntRecord[42].trim());  
        csvRecord.MedPLCEst2_5_2 = this.compareByValid(curruntRecord[43].trim());  
        csvRecord.MedPLCEst3_5_3 = this.compareByValid(curruntRecord[44].trim());  
        csvRecord.MedPLCEst4_5_4 = this.compareByValid(curruntRecord[45].trim());  
        csvRecord.MedPLCEst5_5_5 = this.compareByValid(curruntRecord[46].trim());  
        csvRecord.MedPLCEst6_5_6 = this.compareByValid(curruntRecord[47].trim());  
        csvRecord.MedPLCCom_5_7 = this.compareByValid(curruntRecord[48].trim());  
        csvRecord.MedPLCInd_5_8 = this.compareByValid(curruntRecord[49].trim());  
        csvRecord.MedPLCOfc_5_9 = this.compareByValid(curruntRecord[50].trim());  
        csvRecord.MedPLCOtr_5_10 = this.compareByValid(curruntRecord[51].trim());  
        
        csvRecord.MedRFEst1_6_1 = this.compareByValid(curruntRecord[52].trim());  
        csvRecord.MedRFEst2_6_2 = this.compareByValid(curruntRecord[53].trim());  
        csvRecord.MedRFEst3_6_3 = this.compareByValid(curruntRecord[54].trim());  
        csvRecord.MedRFEst4_6_4 = this.compareByValid(curruntRecord[55].trim());  
        csvRecord.MedRFEst5_6_5 = this.compareByValid(curruntRecord[56].trim());  
        csvRecord.MedRFEst6_6_6 = this.compareByValid(curruntRecord[57].trim());  
        csvRecord.MedRFCom_6_7 = this.compareByValid(curruntRecord[58].trim());  
        csvRecord.MedRFInd_6_8 = this.compareByValid(curruntRecord[59].trim());  
        csvRecord.MedRFOfc_6_9 = this.compareByValid(curruntRecord[60].trim());  
        csvRecord.MedRFOtr_6_10 = this.compareByValid(curruntRecord[61].trim());  
        
        csvRecord.MedGPRSEst1_7_1 = this.compareByValid(curruntRecord[62].trim());  
        csvRecord.MedGPRSEst2_7_2 = this.compareByValid(curruntRecord[63].trim());  
        csvRecord.MedGPRSEst3_7_3 = this.compareByValid(curruntRecord[64].trim());  
        csvRecord.MedGPRSEst4_7_4 = this.compareByValid(curruntRecord[65].trim());  
        csvRecord.MedGPRSEst5_7_5 = this.compareByValid(curruntRecord[66].trim());  
        csvRecord.MedGPRSEst6_7_6 = this.compareByValid(curruntRecord[67].trim());  
        csvRecord.MedGPRSCom_7_7 = this.compareByValid(curruntRecord[68].trim());  
        csvRecord.MedGPRSInd_7_8 = this.compareByValid(curruntRecord[69].trim());  
        csvRecord.MedGPRSOfc_7_9 = this.compareByValid(curruntRecord[70].trim());  
        csvRecord.MedGPRSOtr_7_10 = this.compareByValid(curruntRecord[71].trim());  
        
        csvRecord.MedLPWANEst1_8_1 = this.compareByValid(curruntRecord[72].trim());  
        csvRecord.MedLPWANEst2_8_2 = this.compareByValid(curruntRecord[73].trim());  
        csvRecord.MedLPWANEst3_8_3 = this.compareByValid(curruntRecord[74].trim());  
        csvRecord.MedLPWANEst4_8_4 = this.compareByValid(curruntRecord[75].trim());  
        csvRecord.MedLPWANEst5_8_5 = this.compareByValid(curruntRecord[76].trim());  
        csvRecord.MedLPWANEst6_8_6 = this.compareByValid(curruntRecord[77].trim());  
        csvRecord.MedLPWANCom_8_7 = this.compareByValid(curruntRecord[78].trim());  
        csvRecord.MedLPWANInd_8_8 = this.compareByValid(curruntRecord[79].trim());  
        csvRecord.MedLPWANOfc_8_9 = this.compareByValid(curruntRecord[80].trim());  
        csvRecord.MedLPWANOtr_8_10 = this.compareByValid(curruntRecord[81].trim());  
        
        csvRecord.MedOtroEst1_9_1 = this.compareByValid(curruntRecord[82].trim());  
        csvRecord.MedOtroEst2_9_2 = this.compareByValid(curruntRecord[83].trim());  
        csvRecord.MedOtroEst3_9_3 = this.compareByValid(curruntRecord[84].trim());  
        csvRecord.MedOtroEst4_9_4 = this.compareByValid(curruntRecord[85].trim());  
        csvRecord.MedOtroEst5_9_5 = this.compareByValid(curruntRecord[86].trim());  
        csvRecord.MedOtroEst6_9_6 = this.compareByValid(curruntRecord[87].trim());  
        csvRecord.MedOtroCom_9_7 = this.compareByValid(curruntRecord[88].trim());  
        csvRecord.MedOtroInd_9_8 = this.compareByValid(curruntRecord[89].trim());  
        csvRecord.MedOtroOfc_9_9 = this.compareByValid(curruntRecord[90].trim());  
        csvRecord.MedOtroOtr_9_10 = this.compareByValid(curruntRecord[91].trim()); 
        //csvRecord.Observacion =curruntRecord[92].trim();  
        csvRecord.Observacion = text.trim();  
        csvArr.push(csvRecord);  
      }  
    }  
    return csvArr;  
  }  

  saveRegistro() {
      if (this.registroForm.invalid) {
        return;
      }
        
        let registro = this.registroForm.value;
        let data: Medidores = registro;
       // console.info(registro);

        // se define e identifica la extención del archivo
        let extensiones_permitidas = new Array(".csv");
        let extension = (registro.Archivo.substring(registro.Archivo.lastIndexOf("."))).toLowerCase();
        
        if (this.createMode){
          //let registro: Operador = this.registroForm.value;
          const opt: any = {
            title: 'Gestión reporte AMI',
            text: 'Seguro de guardar el reporte?, Recuerde que una vez se guarde, no se podrán modificar los datos.',
            type: 'question',
            // 'success' | 'error' | 'warning' | 'info' | 'question'
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
                //compruebo si la extensión está entre las permitidas
                let permitida = false;
                for (var i = 0; i < extensiones_permitidas.length; i++) {
                  if (extensiones_permitidas[i] == extension) {
                  permitida = true;
                  break;
                  }
                }   
                
                if (!permitida) {
                        const opt2: any = {
                          title: 'Gestión reporte AMI',
                          text: 'Verifique el archivo que intenta cargar. \nSólo se permite subir archivos con extensión: '+ extensiones_permitidas.join(),
                          type: 'warning',
                          showCancelButton: false,
                          confirmButtonColor: '#6f8ec7',//'#DD6B55',
                          confirmButtonText: 'Aceptar'
                          
                        };
                        Swal(opt2)
                          .then((format) => {  });
                          
                }else{
                        //lee lops datos del archivo cargado
                        this.readFileCSV();
                        //verifica error en el formato
                        //console.info("formato error :"+this.errorFormatFile)    
                          if (this.errorFormatFile===1) {
                            const opt3: any = {
                              title: 'Gestión reporte AMI',
                              text: 'Verifique el archivo que intenta cargar! \nNo coincide con la cantidad de columnas permitidas. Recuerde que los caracteres de separación permitidos en el archivo csv, son el punto y coma (;) o la coma (,) !',
                              type: 'error',
                              showCancelButton: false,
                              confirmButtonColor: '#6f8ec7',//'#DD6B55',
                              confirmButtonText: 'Aceptar'
                            };
                            Swal(opt3)
                              .then((format) => { 
                                this.errorFormatFile=0;
                              });
                              }
                          else if (this.errorTextFile>=1) {
                                    const opt4: any = {
                                      title: 'Gestión reporte AMI',
                                      text: 'Verifique los datos del archivo que intenta cargar! \nExisten valores no númericos, recuerde registrar cifras sin puntos.',
                                      type: 'error',
                                      showCancelButton: false,
                                      confirmButtonColor: '#6f8ec7',//'#DD6B55',
                                      confirmButtonText: 'Aceptar'
                                    };
                                    Swal(opt4)
                                      .then((format) => { 
                                        this.errorTextFile=0;
                                      });
                                      
                              }
                          else{
                                //console.info(this.TextRecordCsv)
                                //console.info(registro)
                                for (let i = 0; i < this.TextRecordCsv.length; i++) {
                                      this.TextRecordCsv[i].Operador=registro.Operador;
                                      this.TextRecordCsv[i].Periodo=registro.Periodo;
                                    // console.info(this.TextRecordCsv[i])
                                    //verifica si el reporte ya existe
                                    this.registroService.get('municipiofull/'+this.TextRecordCsv[i].Municipio)
                                    .subscribe(mun => {
                                      this.Municipio=<any>mun;
                                      if (Object.keys(mun).length<1) {
                                            this.showToast('error', 'Gestión reporte AMI!', 'El código del municipio '+this.TextRecordCsv[i].Municipio+', es incorrecto .<br>Verifique los datos e intente de nuevo');
                                          // this.eventChange.emit(true);
                                          }
                                      else{ 
                                                this.TextRecordCsv[i].Departamento=this.Municipio[0].Iddepartamento;
                                                this.TextRecordCsv[i].Usuarioreporta=this.uid;
                                              // console.info(this.TextRecordCsv[i]);
                                                //verifica si el reporte ya existe
                                                this.registroService.get('reporteami/0/'+parseInt(this.TextRecordCsv[i].Operador.Id,10)+'/'+this.TextRecordCsv[i].Periodo.Id+'/'+this.TextRecordCsv[i].Departamento+'/'+this.TextRecordCsv[i].Municipio)
                                                .subscribe(res => {
                                                  if (Object.keys(res).length>0) {
                                                      this.showToast('error', 'Gestión reporte AMI!', 'El reporte ya existe para el périodo, departamento '+this.TextRecordCsv[i].Departamento+' y municipio '+this.TextRecordCsv[i].Municipio+' .<br>Verifique los datos e intente de nuevo');
                                                      this.eventChange.emit(true);
                                                    }
                                                  else
                                                    {
                                                      //se guarda el reporte
                                                      this.registroService.postRegistroCsv('reporteami', this.TextRecordCsv[i])
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
                                  }
                          }
                }
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
