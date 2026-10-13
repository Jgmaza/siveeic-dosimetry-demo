import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

import { CompartomienergiaService } from '../../../@core/data/services/comparto-mienergia.service';
import { CompartomienergiaView } from '../../../@core/data/models/comparto-mienergia/comparto-mienergia_view';
import { Compartomienergia } from '../../../@core/data/models/comparto-mienergia/comparto-mienergia';
import { CompartomienergiaCsv } from '../../../@core/data/models/comparto-mienergia/comparto-mienergia-csv';
import { Operador } from '../../../@core/data/models/operador/operador';
import { Municipio } from './../../../@core/data/models/municipio';
import { Periodo } from '../../../@core/data/models/comparto-mienergia/periodo';

import { CicloFactura } from '../../../@core/data/models/comparto-mienergia/cicloFactura';
import { Servicio } from '../../../@core/data/models/comparto-mienergia/servicioPublico';


@Component({
  selector: 'app-comparto-mienergia-upload',
  templateUrl: './comparto-mienergia-upload.component.html',
  styleUrls: ['./comparto-mienergia-upload.component.scss']
})
export class CompartomienergiaUploadComponent implements OnInit {
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
  Departamento = [];
  Municipio = [];

  Ciclo_Factura = [];
  Servicio_publico = [];
  registro_id: number;

  /*variables separacion de archvo*/
  sizeFormatFile=7;
  divFormatFile:any;
  
  /*variables para lectura de archivo*/  
  uploadedFiles: Array < File > ;
  textFromFileLoaded: any;
  errorFormatFile=0;
  errorTextFile=0;
  errorCantFile=0;
  errorCicloFile=0;
  errorServicioFile=0;
  errorFechaFile=0;
  errorGeoFile=0;

  TextRecordCsv: any;
  CodDeptoCsv: any;

  @Output() eventChange = new EventEmitter();

  info_medidor: Compartomienergia;
  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      public activeModal: NgbActiveModal,
      private registroService: CompartomienergiaService,
      private toasterService: ToasterService,
  ) {

  this.load_UserData();
          
  this.construirForm();
  this.loadOptionsOperador();
  this.loadOptionsPeriodo();
  this.loadCicloFactura();
  this.loadServicio();
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
    ValidByText(dato){
      let valor: any ;
      if(dato !== null && dato !== '' ){
        valor= dato;
      }
      else {
        this.errorTextFile++;
      }
      return valor;
    } 
    
    //valida los datos, nulo y numerico
    ValidByGeo(dato,tipo){
      let valor: any ;
      if(dato === null || dato === ''){
        valor= "0";
      }
      else if((dato !== null && dato !== '') && (Number(dato)>=0 || Number(dato)<0 )){
        valor= dato;
      }
      else {
        this.errorGeoFile++;
      }
      return valor;
    }    
    
    //valida los datos, nulo y numerico
    ValidByCant(dato){
      let valor: any ;
      if(dato === null || dato === ''){
        valor= "0";
      }
      else if(dato !== null && dato !== '' && Number(dato) >= 0 ){
        valor= dato;
      }
      else {
        this.errorCantFile++;
      }
       return valor;
    }        
    
    //valida los datos, nulo y numerico
    ValidByFecha(dato){

      let fecha:any;
      let error=false;
      const mes30=[4,6,9,11];
      const mes31=[1,3,5,7,8,10,12];
      let valor: any ;
      valor=dato;
      if(dato !== null && dato !== '' ){
            fecha = (<string>dato).split('/');  
            if(!Number(fecha[0]) || !Number(fecha[1]) || !Number(fecha[2]) ||
               Number(fecha[0]) < 0 || Number(fecha[1]) < 0 || Number(fecha[2]) < 0) {
                error=true;
              }
            else if(Number(fecha[0]) > 12 || Number(fecha[2]) < 1900 ) {
                error=true;
              }
            else if(Number(fecha[0])===2 && 
                    ((Number(fecha[2])%4)===0 && Number(fecha[1])>29)||
                    ((Number(fecha[2])%4)!==0 && Number(fecha[1])>28) ) {
                error=true;
              }
            else if( (mes30.includes(Number(fecha[0])) && (fecha[1])>30 ) ||
                       (mes31.includes(Number(fecha[0])) && (fecha[1])>31)  ) {
                error=true;
              }    

            if(error===true)  {
              this.errorFechaFile++;
              }
          }
        else {
          this.errorFechaFile++;
          }
      return valor;
    }    

    //valida los datos, nulo y código del servicio publico
    ValidByServicio(dato){
      let sol:any;
      let valor: any ;
      if(dato !== null && dato !== '' ){
            sol=this.Servicio_publico.find(x => (x.Nombre).toLowerCase() == (dato).toLowerCase());
            if(sol && sol.Id>0 )
              { valor= sol.Id;}
            else {
                this.errorServicioFile++;
                valor=0;
              }
        }
      else {
          this.errorServicioFile++;
        }
      return valor;
    }  

    //valida los datos, nulo y código del ciclo de facturacion
    ValidByCiclo(dato){
      let sol:any;
      let valor: any ;
      if(dato !== null && dato !== '' ){
            sol=this.Ciclo_Factura.find(x => (x.Nombre).toLowerCase() == (dato).toLowerCase());
            if(sol && sol.Id>0 )
              { valor= sol.Id;}
            else {
                this.errorCicloFile++;
                valor=0;
              }
        }
      else {
          this.errorCicloFile++;
        }
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
    // console.info(csvRecordsArray)
    //verifica cantidad de columnas del formato
    if(headersRow.length!==7)
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
    this.errorCicloFile=0;
    this.errorServicioFile=0;
    let ServPublico:any;
    let Ciclo:any;
    //console.info(csvRecordsArray)
    for (let i = 1; i < csvRecordsArray.length; i++) {  
      let curruntRecord = (<string>csvRecordsArray[i]).split(this.divFormatFile);  
      if (curruntRecord.length == headerLength) {  
          
          let csvRecord: CompartomienergiaCsv = new CompartomienergiaCsv();
          ServPublico = JSON.parse(this.ValidByServicio(curruntRecord[0].trim()));  
          Ciclo = JSON.parse(this.ValidByCiclo(curruntRecord[3].trim()));  
          csvRecord.Service=curruntRecord[0].trim();
          csvRecord.Servicio_publico = ServPublico;
          csvRecord.Total_recaudo = this.ValidByCant(curruntRecord[1].trim());  
          csvRecord.Fuente_aportes = this.ValidByText(curruntRecord[2].trim());
          csvRecord.Ciclo_facturacion = Ciclo;  
          csvRecord.Cantidad_beneficiarios_estrato1 = this.ValidByCant(curruntRecord[4].trim());  
          csvRecord.Cantidad_beneficiarios_estrato2 = this.ValidByCant(curruntRecord[5].trim());  
          csvRecord.Observacion = this.ValidByText(curruntRecord[6].trim());  
          csvArr.push(csvRecord);  
        }  
      else if (curruntRecord.length>1 && curruntRecord.length !== headerLength) {
        this.errorFormatFile=1;
      }  
    }  
    return csvArr;  
  }  



  saveRegistro() {
      if (this.registroForm.invalid) {
        return;
      }
        
        let registro = this.registroForm.value;
        let data: Compartomienergia = registro;
       // console.info(registro);

        // se define e identifica la extención del archivo
        let extensiones_permitidas = new Array(".csv");
        let extension = (registro.Archivo.substring(registro.Archivo.lastIndexOf("."))).toLowerCase();
        
        if (this.createMode){
          //let registro: Operador = this.registroForm.value;
          const opt: any = {
            title: 'Gestión reporte comparto mi energía',
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
                          title: 'Gestión reporte comparto mi energía',
                          text: 'Verifique el archivo que intenta cargar. \nSólo se permite subir archivos con extensión: '+ extensiones_permitidas.join(),
                          type: 'warning',
                          showCancelButton: false,
                          confirmButtonColor: '#6f8ec7',//'#DD6B55',
                          confirmButtonText: 'Aceptar'
                          
                        };
                        Swal(opt2)
                          .then((format) => {  });
                          
                }else{
                        //lee los datos del archivo cargado
                        this.readFileCSV();
                        // verifica error en el formato
                        // console.info("formato error :"+this.errorFormatFile)    
                          if (this.errorFormatFile===1) {
                                  const opt3: any = {
                                    title: 'Gestión reporte comparto mi energía',
                                    text: 'Verifique el formato que intenta cargar! \nNo coincide con la cantidad de columnas permitidas! \nRecuerde que el caracter de separación es la coma ( , ), por tanto abstengase de usar dicho caracter en el texto que ingresa a los campos.',
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
                          else if (this.errorTextFile>=1 || this.errorCantFile>=1 ||
                                   this.errorCicloFile>=1 || this.errorServicioFile>=1 || 
                                   this.errorFechaFile>=1 || this.errorGeoFile>=1) {
                                   let mensaje ='Verifique los datos del archivo que intenta cargar! \n.';

                                    if (this.errorCicloFile>=1) {
                                      mensaje +='\n\n * Existen '+this.errorCicloFile+' registros en el campo "Ciclo de facturación", que ho han sido diligenciados.';
                                    }
                                    if (this.errorServicioFile>=1 ) {
                                      mensaje +='\n\n * Existen '+this.errorServicioFile+' registros en el campo "Servicio Público", que ho han sido diligenciados o no corresponden con los tipos existentes.';
                                    }
                                    if (this.errorFechaFile>=1 ) {
                                      mensaje +='\n\n * Existen '+this.errorFechaFile+' registros en el campo "Fecha inicio", que no han sido diligenciados o no corresponde al formato mes/dia/año (mm/dd/yyyy).';
                                    }
                                    if (this.errorCantFile>=1 ) {
                                      mensaje +='\n\n * Existen '+this.errorCantFile+' registros en el campo "Total recaudo" o "Cantidad de beneficiarios", que no han sido diligenciados o no corresponden al formato definido!\n Recuerde que formato definido es númerico entero.';
                                    }
                                    if (this.errorTextFile>=1) {
                                      mensaje +='\n\n * Existen '+this.errorTextFile+' registros en el campo "Fuente de aportes" u "Observaciones", que no han sido diligenciados o no corresponden al formato definido!\n Recuerde no usar la coma ( , ) ya que es el caracter definido para separación en el archivo CSV';
                                    }
                                    if (this.errorGeoFile>=1 ) {
                                      mensaje +='\n\n * Existen '+this.errorGeoFile+' registros en los campos "Latitud", "Longitud" o "Altitud", que no han sido diligenciados o no corresponden al formato definido!\n Recuerde registrar valores númericos, separando los decimales con el punto ( 0.0 )!\n Recuerde no usar la coma ( , ) ya que es el caracter definido para separación en el archivo CSV ';
                                    }

                                    const opt4: any = {
                                      title: 'Gestión reporte comparto mi energía',
                                      text: mensaje,
                                      type: 'error',
                                      showCancelButton: false,
                                      confirmButtonColor: '#6f8ec7',//'#DD6B55',
                                      confirmButtonText: 'Aceptar'
                                    };
                                    Swal(opt4)
                                      .then((format) => { 
                                        this.errorTextFile=0;
                                        this.errorCicloFile=0;
                                        this.errorServicioFile=0;
                                        this.errorFechaFile=0;
                                        this.errorCantFile=0;
                                        this.errorGeoFile=0;
                                      });
                              }
                          else{
                                //console.info(this.TextRecordCsv)
                                //console.info(registro)
                                for (let i = 0; i < this.TextRecordCsv.length; i++) {
                                      this.TextRecordCsv[i].Operador=registro.Operador;
                                      this.TextRecordCsv[i].Periodo=registro.Periodo;
                                      // console.info(this.TextRecordCsv[i])
                                      // verifica si el reporte ya existe
                                      this.registroService.get('reportecompartoenrg/0/'+parseInt(this.TextRecordCsv[i].Operador.Id,10)+'/'+this.TextRecordCsv[i].Periodo.Id+'/'+this.TextRecordCsv[i].Servicio_publico+'/')
                                      .subscribe(res => {
                                        if (Object.keys(res).length>0) {
                                            this.showToast('error', 'Gestión reporte comparto mi energía!', `El reporte ya existe para el Servicio Público ${this.TextRecordCsv[i].Service} y el périodo ${this.TextRecordCsv[i].Periodo.Id}.<br>Verifique los datos e intente de nuevo`);
                                            this.eventChange.emit(true);
                                          }
                                      else{ 
                                              this.TextRecordCsv[i].Usuarioreporta=this.uid;
                                                //se guarda el reporte
                                                this.registroService.postRegistroCsv('reportecompartoenrg', this.TextRecordCsv[i])
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

  loadServicio(): void {
      this.registroService.get('servicioscomparto/0/')
       .subscribe( res => {
        if (res !== null) {
          this.Servicio_publico = <Array<Servicio>>res;
        }
      });
  } 

  loadCicloFactura(): void {
    this.registroService.get('ciclofactura')
     .subscribe( res => {
      if (res !== null) {
        this.Ciclo_Factura = <Array<CicloFactura>>res;
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
