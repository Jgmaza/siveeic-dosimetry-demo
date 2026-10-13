import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as XLSX from 'xlsx';
import { Observable, interval, Subscription } from 'rxjs';
import { InteractiveProgressBarComponent } from '../../components/progress-bar/interactive-progress-bar/interactive-progress-bar.component';
import { __await } from 'tslib';
import { DosimetriaService } from '../../../@core/data/services/dosimetria.service';
import { DosimetriaView } from '../../../@core/data/models/dosimetria/dosimetria_view';
import { Dosimetria } from '../../../@core/data/models/dosimetria/dosimetria';
import { Operador } from '../../../@core/data/models/operador/operador';
import { Periodo } from '../../../@core/data/models/general/periodo';
import { Ciclo } from '../../../@core/data/models/dosimetria/ciclo';
import { TipoDosimetro } from './../../../@core/data/models/dosimetria/tipo_dosimetro';
import { TecnoDosimetro } from './../../../@core/data/models/dosimetria/tecno_dosimetro';
import { PracticaRi } from './../../../@core/data/models/dosimetria/practica_ri';
import { Genero } from './../../../@core/data/models/genero';
import { NivelEducacion } from './../../../@core/data/models/nivel_educacion';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-dosimetria-upload',
  templateUrl: './dosimetria-upload.component.html',
  styleUrls: ['./dosimetria-upload.component.scss'],
})
export class DosimetriaUploadComponent implements OnInit, OnDestroy {
  

  config: ToasterConfig;
  settings: any;
  uid: number;
  user_operador: number;

  createMode: boolean = true;
  registro: DosimetriaView;
  registroForm: FormGroup;
  cargaArchivo: FormGroup
  /*variables para definir los selects de formulario */

  errorMessages: string[] = [];
  errorSummary: any = {}; // Resumen de errores
  Operador = [];
  Periodo = [];
  Ciclo = [];
  Departamento = [];
  Municipio = [];
  Genero_empleado = [];
  Nivel_educacion = [];
  Tipo_dosimetro = [];
  Tecno_dosimetro = [];
  Practica_ri = [];
  Dosimetria = [];
  registro_id: number;
  /*variables separacion de archvo*/
  sizeFormatFile = 41;
  divFormatFile: any;
  /*variables para lectura de archivo*/
  file: File;
  arrayBuffer: any;
  filelist: any
  fileSize: any
  errorTextFile: any;
  errorFormatFile = 0;
  count = 0;
  upPorc = 0;
  filas = 0;
  /*variables para lectura de archivo*/
  uploadedFiles: Array < File > ;
  textFromFileLoaded: any;
  errorCantFile = 0;
  errorGeneroFile = 0;
  errorEducacionFile = 0;
  errorPracticaFile = 0;
  errorDosimetroFile = 0;
  errorTecnoDosimetroFile = 0;
  errorFechaFile = 0;
  errorGeoFile = 0;
  errorMunFile = 0;
  TextRecordCsv: any;
  CodDeptoCsv: any;
  errorFileUrl: string | null = null;
  jsonFileUrl: string | null = null;
  isValid: boolean = false;
  enableSaveButtonFlag: boolean = false;
  showProgressBar: boolean = false;
  showForm: boolean = false;
  state: 'default' | 'completed' = 'default'; // Estado para controlar la vista
  selectorPeriodoManual = environment.dosimetriaSelectorPeriodoManual;
  lastSaveSummary: { totalRecibidos?: number; totalInsertados?: number; totalArchivosOperadorPeriodo?: number; totalArchivosCargados?: number } | null = null;
  

  // observable
  subscription: Subscription;
  @ViewChild(InteractiveProgressBarComponent) barra: InteractiveProgressBarComponent;
  @Output() eventChange = new EventEmitter();
  
  info_medidor: Dosimetria;
  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      private registroService: DosimetriaService,
      private toasterService: ToasterService,
      private router: Router,
  ) {

  this.load_UserData();
  this.construirForm();
  this.loadOptionsOperador();
  this.loadOptionsPeriodoAnio();
  this.loadOptionsCiclo();
  this.loadOptionsGenero();
  this.loadOptionsEducacion();
  this.loadOptionsPractica();
  this.loadOptionsDosimetro();
  this.loadOptionsTecnoDosimetro();
}

 construirForm() {
  this.registroForm = this.formBuilder.group({
    Operador: [null, Validators.required],
    Periodo: [null, this.selectorPeriodoManual ? Validators.required : []],
    Ciclo: [null, Validators.required],
    //Archivo: [null, Validators.required],
    Boton: ['1', Validators.compose([Validators.min(1)]) ],
  });
  this.cargaArchivo = this.formBuilder.group({
    Archivo: [null, Validators.required]
  });
}

  ngOnInit() {
    // carga los datos rescatados
    if (!this.createMode) {
      this.loadRegistro(this.registro_id);
    }
  }

  enableSaveButton() {
    const periodoOk = !this.selectorPeriodoManual || !!this.registroForm.get('Periodo').value;
    const enabled = this.registroForm.valid && this.isValid && periodoOk;
    console.log("enableSaveButton:", enabled);
    return enabled;
  }

  private getPeriodoId(): number | undefined {
    const p = this.registroForm.get('Periodo').value;
    if (!p) return undefined;
    return typeof p === 'object' ? p.Id : parseInt(p, 10);
  }

  //Se agrega verificacion de que no sea null
  ngOnDestroy() {
    if (this.subscription) {
        this.subscription.unsubscribe();
    }
  }

  loadRegistro(registro_id) {
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
    compareById(o1, o2) {
      if (o1 == null || o2 == null) {
        return false;
      }
      return o1.Id === o2.Id;
    }
    // valida los datos, nulo y numerico
    ValidByText(dato) {
      let valor: any ;
      if (dato !== null && dato !== '' ) {
        valor = dato;
      } else {
        this.errorTextFile++;
      }
      return valor;
    }
     // valida los datos, nulo y numerico
    ValidByGeo(dato, tipo) {
      let valor: any ;
      if (dato === null || dato === '') {
        valor = '0';
      } else if ((dato !== null && dato !== '') && (Number(dato) >= 0 || Number(dato) < 0 )) {
        valor = dato;
      } else {
        this.errorGeoFile++;
      }
      return valor;
    }
    // valida los datos, nulo y numerico
    ValidByMun(dato) {
      let valor: any ;
      if (dato === null || dato === '') {
        valor = '0';
      } else if (dato !== null && dato !== '' && Number(dato) >= 0 ) {
        valor = dato;
      } else {
        this.errorMunFile++;
      }
       return valor;
    }
    // valida los datos, nulo y numerico
    ValidByCant(dato) {
      let valor: any ;
      if (dato === null || dato === '') {
        valor = '0';
      } else if (dato !== null && dato !== '' && Number(dato) >= 0 ) {
        valor = dato;
      } else {
        this.errorCantFile++;
      }
       return valor;
    }

  private handlePartialMessage(msg: any) {
    if (!msg) return;

    const { progress = 0, errors = [], filename = null } = msg || {};

        if (typeof msg.progress === 'number') {
          try { this.barra.increaseValue(msg.progress); } catch (e) { /* ignore */ }
        }

        if (msg.status) {
          // manejo de estados (started, processing, validating, errors found, completed, error)
          if (msg.status === 'error') {
            const detalles = Array.isArray(msg.errors) ? msg.errors.map((e:any)=> e.message || JSON.stringify(e)).join(' | ') : '';
            this.showToast('error', 'Error en validación', detalles || 'Error desconocido');
          } else if (msg.status === 'errors found') {
              this.errorFileUrl = msg.filename || null;
              this.showToast('warning', 'Validación', `Errores encontrados. Archivo: ${msg.filename || ''}`);
  
          } else if (msg.status === 'completed') {
            this.jsonFileUrl = msg.filename || null;
            this.isValid = true;
            this.enableSaveButtonFlag = true;
            console.log('Validation completed. File:', msg.filename, this.isValid);
            this.showToast('success', 'Validación', 'Validación completada');
          } else {
            // mensajes informativos
            console.log('partial status', msg.status);
          }
        }

        // si el servidor envía detalles puntuales de errores en msg.errors
        if (Array.isArray(msg.errors) && msg.errors.length > 0) {
          // actualizar UI con mensajes parciales si lo deseas
          const mensajes = msg.errors.map((e:any) => e.message || JSON.stringify(e)).join(' | ');
          console.log('Errores parciales:', mensajes);
        }         
  }

  downloadErrorFile() {
    if (!this.errorFileUrl) return;
    this.registroService.downloadErrorFile('validararchivodosimetria', this.errorFileUrl)
      .then(blob => {
        const name = this.errorFileUrl.split('/').pop() || 'errores.xlsx';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
    .catch(err => {
      console.error('Error descargando archivo de errores', err);
      this.showToast('error', 'Descarga', 'No se pudo descargar el archivo de errores');
    });
  }

fileChange(element) {

    this.file = element.target.files[0];
    this.isValid = false;
    this.enableSaveButtonFlag = false;
    this.showProgressBar = true;

    console.log('Validar archivo dosimetría:', this.user_operador);
    const periodoId = this.getPeriodoId();
    if (this.selectorPeriodoManual && !periodoId) {
      this.showToast('warning', 'Periodo requerido', 'Seleccione el año del reporte antes de cargar el archivo.');
      return;
    }
    this.registroService.postValidacionArchivo('validararchivodosimetria', this.user_operador, this.file, this.handlePartialMessage.bind(this), periodoId);
    /*
        .subscribe({
          next: (res: any) => {
            console.log('Progreso res', res);
            const { progress = 0, } = res || {};
            this.barra.increaseValue(progress);
          },
          error: (err) => {
            
            const { progress = 0, errors = [] } = err || {};
            console.log('Progreso err', err);

            let detalles = '';
            
            if (errors.length) {
              detalles = errors.map((e: any) => e.message ? e.message : String(e)).join(' | ');
            }
            else {
              detalles = String(errors || '');
            }

            this.showToast('error', 'Error en el archivo', 'El archivo presenta errores, verifique e intente nuevamente. Detalles: ' + detalles);
            this.barra.increaseValue(progress);
          },
          complete: () => {
            console.log('Completado');
            this.barra.increaseValue(100);
          },
        });*/
        // const resultado = <any>res;
        // this.TextRecordCsv = resultado.TextRecordCsv;
        // this.CodDeptoCsv = resultado.CodDeptoCsv;

    /*
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(this.file);
    fileReader.onload = (e) => {
        this.arrayBuffer = fileReader.result;
        let data = new Uint8Array(this.arrayBuffer);
        let arr = new Array();
        for (let i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
        let bstr = arr.join('');
        let workbook = XLSX.read(bstr, {type:'binary'});
        // var first_sheet_name = workbook.SheetNames[0];
        let worksheet = workbook.Sheets['Reporte'];
        let arraylist = XLSX.utils.sheet_to_json(worksheet, {raw: true});
        this.fileSize = arraylist.length;
        let estColumns = Object.keys(arraylist[0]);
        // console.info(estColumns)
        if (estColumns.length != 42) {
          this.errorFormatFile++;
          this.showToast('error', 'Error en el archivo', 'El archivo debe tener exactamente 42 columnas.');
              }
        // Procesar cada fila
        arraylist.forEach((fila: any, index: number) => {
          const errores = [];
          const filaNum = index + 1; // Número de la fila (index comienza en 0)

          // Validar Nit de la Entidad
          if (!fila.Nit_Entidad || fila.Nit_Entidad === '') {
              errores.push(`Fila ${filaNum}: El Nit de la entidad es obligatorio.`);
          }

          // Validar que el campo Documento_TOE exista
          if (!fila.Documento_TOE || fila.Documento_TOE === '') {
              errores.push(`Fila ${filaNum}: El campo Documento_TOE es obligatorio.`);
          }

          // Validar que Genero_TOE exista y aplicarle toLowerCase() solo si no es undefined o null
          if (fila.Genero_TOE && typeof fila.Genero_TOE === 'string') {
              const genero = this.Genero_empleado.find(g => g.Nombre.toLowerCase() === fila.Genero_TOE.toLowerCase());
              if (!genero) {
                  errores.push(`Fila ${filaNum}: El género especificado no es válido.`);
              }
          } else {
              errores.push(`Fila ${filaNum}: El campo Género es obligatorio y debe ser un texto.`);
          }

          // Validar que Nivel de Educación exista
          if (fila.Nivel_educacion_TOE && typeof fila.Nivel_educacion_TOE === 'string') {
              const nivel = this.Nivel_educacion.find(n => n.Nombre.toLowerCase() === fila.Nivel_educacion_TOE.toLowerCase());
              if (!nivel) {
                  errores.push(`Fila ${filaNum}: El nivel de educación no es válido.`);
              }
          } else {
              errores.push(`Fila ${filaNum}: El campo Nivel de Educación es obligatorio y debe ser un texto.`);
          }

          // Agregar más validaciones según sea necesario...

          // Si hay errores, almacenarlos
          if (errores.length > 0) {
              this.errorMessages.push(errores.join(', '));
          }
      });

      // Después de procesar todas las filas
      if (this.errorMessages.length > 0) {
          // Mostrar los errores acumulados
          this.showToast('error', 'Error en el archivo', this.errorMessages.join(' | '));
      } else {
          // Mostrar mensaje de éxito si no hubo errores en ninguna fila
          this.showToast('success', 'Validación exitosa', 'El archivo se ha validado correctamente sin errores.');
      }

    }
      

    const periodoSeleccionado = periodoSeleccionadoObj.Id; // Extrae el valor numérico
    console.log('Periodo seleccionado (Id):', periodoSeleccionado);

    const esPeriodoReciente = periodoSeleccionado >= 2024; // Determina si es reciente
    console.log('Es periodo reciente:', esPeriodoReciente);
  
      let fileReader = new FileReader();
      fileReader.readAsArrayBuffer(this.file);
      fileReader.onload = (e) => {
          this.arrayBuffer = fileReader.result;
          const data = new Uint8Array(this.arrayBuffer);
          const arr = new Array();
          for (let i = 0; i !== data.length; ++i) arr[i] = String.fromCharCode(data[i]);
          const bstr = arr.join("");
          const workbook = XLSX.read(bstr, { type: "binary" });
           // Verifica si la hoja "Reporte" existe
        if (!workbook.Sheets['Reporte']) {
          this.showToast('error', 'Error de validación', 'El archivo debe contener una hoja llamada "Reporte".');
          return; // Detiene la ejecución si la hoja no existe
      }
      console.log('Hoja "Reporte" encontrada.');
          const worksheet = workbook.Sheets['Reporte'];
          const arraylist = XLSX.utils.sheet_to_json(worksheet, { raw: true });
          this.fileSize = arraylist.length;
  
          // Inicializa el resumen de errores
          this.errorSummary = {};
  
          // Procesa cada fila
          arraylist.forEach((fila: any, index: number) => {
              const filaNum = index + 2;
              console.log(`Procesando fila ${filaNum}:`, fila); // Muestra el contenido completo de la fila
  
              // Validación condicional de Nit_Entidad según el periodo
              
              
              if (esPeriodoReciente) {
                console.log(`Validando periodo reciente (2024 o más) en la fila ${filaNum}`);

                  // Validaciones para periodo 2024 o más
                  const nitEntidad = fila.Nit_Entidad;
                  console.log(`Validando Nit_Entidad: ${nitEntidad}`);
                  if (!nitEntidad || !/^\d{7,10}$/.test(nitEntidad)) {
                      this.addToErrorSummary("El Nit de la entidad debe ser numérico, sin caracteres especiales y de 7 a 10 dígitos para el periodo 2024 o más.", filaNum);
                  }
                  // Validación de Documento_TOE, común para ambos periodos
              const documentoTOE = String(fila.Documento_TOE); // Asegura que sea string para evitar el error de .trim()
              console.log(`Validando Documento_TOE: ${documentoTOE}`);
              if (!documentoTOE || documentoTOE.trim() === '') {
                  this.addToErrorSummary("El Documento TOE es obligatorio.", filaNum);
              } else {
                  if (!/^\d+$/.test(documentoTOE)) {
                      this.addToErrorSummary("El Documento TOE debe ser numérico sin puntos, comas, ni espacios.", filaNum);
                  }
                  if (/\s|\.|,/.test(documentoTOE)) {
                      this.addToErrorSummary("El Documento TOE no debe contener espacios, puntos o comas.", filaNum);
                  }
                  if (documentoTOE.length < 5 || documentoTOE.length > 12) {
                      this.addToErrorSummary("El Documento TOE debe tener entre 5 y 12 dígitos.", filaNum);
                  }
              }
              // Validación de Nombres_TOE
        const nombresTOE = fila.Nombres_TOE;
        console.log(`Validando Nombres_TOE:`, nombresTOE);
        if (typeof nombresTOE !== 'string' || nombresTOE.trim() === '') {
            this.addToErrorSummary("El Nombre TOE es obligatorio.", filaNum);
        } else {
            if (/[,\.]/.test(nombresTOE)) {
                this.addToErrorSummary("El Nombre TOE no debe contener comas ni puntos.", filaNum);
            }
            if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/.test(nombresTOE)) {
                this.addToErrorSummary("El Nombre TOE debe contener solo letras y espacios.", filaNum);
            }
                  // Validación de Apellidos_TOE
              const apellidosTOE = fila.Apellidos_TOE;
              if (typeof apellidosTOE !== 'string' || apellidosTOE.trim() === '') {
                  this.addToErrorSummary("Los Apellidos del TOE son obligatorios.", filaNum);
              } else {
                  if (/[,\.]/.test(apellidosTOE)) {
                      this.addToErrorSummary("Los Apellidos del TOE no deben contener comas ni puntos.", filaNum);
                  }
                  if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/.test(apellidosTOE)) {
                      this.addToErrorSummary("Los Apellidos del TOE deben contener solo letras, incluyendo ñ y caracteres acentuados, y espacios.", filaNum);
                  }
              }
            }
            // Validación de Fecha_nacimiento_TOE en formato dd/mm/yyyy
            const fechaNacimientoTOE = fila.Fecha_nacimiento_TOE;
            if (typeof fechaNacimientoTOE !== 'string' || fechaNacimientoTOE.trim() === '') {
                this.addToErrorSummary("La Fecha de nacimiento del TOE es obligatoria.", filaNum);
            } else {
                const fechaPattern = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
                if (!fechaPattern.test(fechaNacimientoTOE)) {
                    this.addToErrorSummary("La Fecha de nacimiento del TOE debe estar en formato dd/mm/yyyy.", filaNum);
                } else {
                    const [day, month, year] = fechaNacimientoTOE.split("/").map(Number);
                    const date = new Date(year, month - 1, day);
                    if (date.getDate() !== day || date.getMonth() + 1 !== month || date.getFullYear() !== year) {
                        this.addToErrorSummary("La Fecha de nacimiento del TOE no es una fecha válida.", filaNum);
                    }
                }
            }
            // Validación de Título_TOE
            const tituloTOE = fila.Título_TOE;
            if (tituloTOE) {
                if (/[,]/.test(tituloTOE)) {
                    this.addToErrorSummary("El Título TOE no debe contener comas.", filaNum);
                }
            }
              } else {
                  // Validaciones para periodo 2023 o menos
                //if (!nitEntidad || nitEntidad.length < 5) {
                //      this.addToErrorSummary("El Nit de la entidad debe tener al menos 5 caracteres para el periodo 2023 o menos.", filaNum);
                //  }
              }
          });
  
          // Mostrar el resumen de errores o éxito
          if (Object.keys(this.errorSummary).length > 0) {
              this.showErrorSummaryToast();
              this.downloadErrorReportAsExcel();
          } else {
              this.showToast('success', 'Validación exitosa', 'El archivo se ha validado correctamente sin errores.');
          }
      }*/
  }
    
    // Función para agregar errores al resumen
    addToErrorSummary(errorType: string, filaNum: number) {
      if (!this.errorSummary[errorType]) {
        this.errorSummary[errorType] = { total: 0, filas: [] };
      }
      this.errorSummary[errorType].total += 1;
      this.errorSummary[errorType].filas.push(filaNum);
    }
    
    private showErrorSummaryToast() {
      let errorMessage = 'Error en el archivo. Se encontraron los siguientes problemas:<br><br>';
      Object.keys(this.errorSummary).forEach((errorType) => {
        const errorData = this.errorSummary[errorType];
        const filasTexto = errorData.filas.slice(0, 10).join(', ') + (errorData.filas.length > 10 ? ', ...' : '');
        errorMessage += `- ${errorType} Total: ${errorData.total} errores (filas: ${filasTexto})<br>`;
      });
      
      // Añade un botón para descargar el reporte de errores
      errorMessage += `<button id="downloadReportButton" 
                           style="margin-top:10px; color: #ffffff; background-color: #ff0000; 
                           border: none; padding: 5px 10px; cursor: pointer;">
                           Descargar reporte completo de errores
                       </button>`;
  
      this.showToast('error', 'Error en el archivo', errorMessage);
  
      // Añadir el evento de descarga al botón después de que el Toast se ha creado
      setTimeout(() => {
          const downloadButton = document.getElementById('downloadReportButton');
          if (downloadButton) {
              // Prevenir el cierre del toast al hacer clic
              downloadButton.addEventListener('click', (event) => {
                  event.stopPropagation();
                  this.downloadErrorReportAsExcel();
              });
          }
      }, 0);
  }
  
    
    // Función para descargar el resumen de errores como archivo Excel
    downloadErrorReportAsExcel() {
      const errorRows = [];
      const maxRowsPerCell = 100; // Ajuste máximo seguro
  
      Object.keys(this.errorSummary).forEach((errorType) => {
          const { total, filas } = this.errorSummary[errorType];
  
          // Limita el listado de filas en cada celda
          const filasTexto = filas.slice(0, maxRowsPerCell).join(', ');
          const truncatedText = filas.length > maxRowsPerCell ? `${filasTexto}, ...` : filasTexto;
  
          errorRows.push({ 
              Error: errorType, 
              Total: total, 
              Filas: truncatedText 
          });
      });
      
      // Genera el archivo Excel
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(errorRows);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Errores");
  
      // Desencadena la descarga
      XLSX.writeFile(wb, "Reporte_Errores.xlsx");
  }
  


    

  saveRegistro() {
      const registro = this.registroForm.value;
      //const data: Dosimetria = { Operador: 0, Periodo: periodo.toString(), Ciclo: "Anual" };
      registro.Usuarioreporta = this.uid;
      // se define e identifica la extención del archivo
      //const extensiones_permitidas = new Array('.csv', '.xlsx');
      //const extension = (registro.Archivo.substring(registro.Archivo.lastIndexOf('.'))).toLowerCase();
      registro.Archivo = this.jsonFileUrl;
      const periodoId = this.getPeriodoId();
      if (this.selectorPeriodoManual) {
        if (!periodoId) {
          this.showToast('warning', 'Periodo requerido', 'Seleccione el año del reporte antes de guardar.');
          return;
        }
        registro.Periodo = periodoId;
      }
      if (this.createMode) {
        // let registro: Operador = this.registroForm.value;
        const opt: any = {
          title: 'Gestión reporte dosimetria',
          text: 'Seguro de guardar el reporte?, Recuerde que una vez se guarde, no se podrán modificar los datos.',
          type: 'question',
          // 'success' | 'error' | 'warning' | 'info' | 'question'
          showCancelButton: true,
          confirmButtonColor: '#6f8ec7', // '#DD6B55',
          confirmButtonText: 'Si, Guardar!',
          cancelButtonText: 'No, cancelar!',
        };
        Swal(opt)
          .then((willDelete) => {
            if (willDelete.value) {
              // compruebo si la extensión está entre las permitidas
              /*let permitida = false;
              for (let i = 0; i < extensiones_permitidas.length; i++) {
                if (extensiones_permitidas[i] === extension) {
                permitida = true;
                break;
                }
              }
              if (!permitida) {
                console.warn("Archivo con extensión no permitida");
                      const opt2: any = {
                        title: 'Gestión reporte dosimetria',
                        text: 'Verifique el archivo que intenta cargar. \nSólo se permite subir archivos con extensión: ' + extensiones_permitidas.join(),
                        type: 'warning',
                        showCancelButton: false,
                        confirmButtonColor: '#6f8ec7', // '#DD6B55',
                        confirmButtonText: 'Aceptar',
                      };
                      Swal(opt2)
                        .then((format) => {  });

              } else */{
                  this.registroForm.controls['Boton'].setValue('0'); // deshabilitar boton cargar
                  this.count = 0;
                  this.barra.initialValue();
                  this.dataAsync(registro)
                      .then(result => {
                        const rsta = JSON.parse(JSON.stringify(result));
                        if (rsta.Registro && rsta.Registro === 'OK') {
                          this.showToast('success', 'Gestión reporte dosimetría', 'Registro exitoso de reporte de dosimetría');
                        }
                        const data = rsta && rsta.data ? rsta.data : rsta;
                        this.lastSaveSummary = {
                          totalRecibidos: data && data.totalRecibidos,
                          totalInsertados: data && data.totalInsertados,
                          totalArchivosOperadorPeriodo: data && data.totalArchivosOperadorPeriodo,
                          totalArchivosCargados: data && data.totalArchivosCargados,
                        };
                        this.state = 'completed'; // Cambia el estado a 'completed' para mostrar el mensaje de éxito
                        this.eventChange.emit(true);
                      })
                      .catch(error => {
                        console.error("Error en dataAsync:", error);  // Bandera de error en dataAsync
                      });
              }
            }
          });
    }
}

async dataAsync(registro) {
  return new Promise((resolve, reject) => {
         this.registroService.postRegistroMasivo('masivodosimetria', registro, this.file).subscribe(res => {
             const resultado = <any>res;
             resolve(resultado);
           });
           this.upPorc  = (((this.fileSize * 300) + 10000) / 100);
           // declaro observable y ejecuto incremento barra, con el cambio en el observable
           const number$ = interval(this.upPorc);
           this.subscription = number$.subscribe((res) => {this.barra.increaseValue(res)
                                                   if (res >= 100) {
                                                     this.subscription.unsubscribe();
                                                   }
                                       });
   });
 }
/*
async dataAsyncORG(registro){
 return new Promise((resolve,reject)=>{
        //Creo nuevo observable
       const observable = new Observable(subscriber => {
        this.registroService.postRegistroMasivo('masivodosimetria', registro,this.file).subscribe(res => {
            let resultado = <any>res;
            resolve(resultado);
          });
            do {
              this.count=(this.count+1);
              this.upPorc  = ((this.count/((this.fileSize*200)+1000000))*100);
              subscriber.next(this.upPorc);  // asigna el valor a observable
              }
            while (this.upPorc<100);
        });
      //ejecuto incremento barra, con el cambio en el observable
      observable.subscribe((res) => {this.barra.increaseValue(res)});
  });
}*/

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
    const operador: any = Operador;
    const endpoint = this.user_operador === 0
      ? 'operador_light'
      : ('operador/' + this.user_operador);
    this.registroService.get(endpoint)
      .subscribe(res => {
        if (res !== null) {
          this.Operador = <Array<Operador>>res;
          if (this.user_operador !== 0) {
              operador.Operador = this.Operador[0];
              this.registroForm.patchValue(operador);
            }
        }
      });
  }

loadOptionsPeriodoAnio(): void {
    this.registroService.get('periodoanio/2000')
      .subscribe(res => {
        if (res !== null) {
          this.Periodo = <Array<Periodo>>res;
          if (this.selectorPeriodoManual && this.Periodo.length) {
            const defaultYear = new Date().getFullYear() - 1;
            const match = this.Periodo.find(p => p.Id === defaultYear) || this.Periodo[0];
            this.registroForm.patchValue({ Periodo: match });
          }
        }
      });
  }

loadOptionsPeriodo(): void {
    const periodo: Array<any> = [];
    this.registroService.get('periodo')
      .subscribe(res => {
        if (res !== null) {
         // console.info(res);
          this.Periodo = <Array<Periodo>>res;
        }
      });
  }

loadOptionsCiclo(): void {
    const fuente: Array<any> = [];
    this.registroService.get('ciclodosimetria')
      .subscribe(res => {
        if (res !== null) {
          // console.info(res);
          const ciclo  = <Array<Ciclo>>res;
          this.Ciclo = ciclo.filter( Ciclos => Ciclos.Nombre === 'Anual');
          if (this.Ciclo.length && !this.registroForm.get('Ciclo').value) {
            this.registroForm.patchValue({ Ciclo: this.Ciclo[0] });
          }
        }
      });
  }

loadOptionsGenero(): void {
  const solucion: Array<any> = [];
  this.registroService.get('genero')
    .subscribe(res => {
      if (res !== null) {
        this.Genero_empleado = <Array<Genero>>res;
      }
    });
}

loadOptionsEducacion(): void {
  const fuente: Array<any> = [];
  this.registroService.get('niveleducacion')
    .subscribe(res => {
      if (res !== null) {
        this.Nivel_educacion = <Array<NivelEducacion>>res;
      }
    });
}

loadOptionsDosimetro(): void {
  const fuente: Array<any> = [];
  this.registroService.get('tipodosimetro')
    .subscribe(res => {
      if (res !== null) {
        this.Tipo_dosimetro = <Array<TipoDosimetro>>res;
      }
    });
}

loadOptionsTecnoDosimetro(): void {
  const fuente: Array<any> = [];
  this.registroService.get('tecnodosimetro')
    .subscribe(res => {
      if (res !== null) {
        this.Tecno_dosimetro = <Array<TecnoDosimetro>>res;
      }
    });
}

loadOptionsPractica(): void {
  const fuente: Array<any> = [];
  this.registroService.get('practicasri')
    .subscribe(res => {
      if (res !== null) {
        this.Practica_ri = <Array<PracticaRi>>res;
      }
    });
}

openFileSelector() {
    const fileInput = document.getElementById('Archivo');
    this.isValid = false;
    this.errorFileUrl = null;
    this.jsonFileUrl = null;
    this.showProgressBar = false; // Resetear la visibilidad si se abre de nuevo
    
    if (fileInput) {
      fileInput.click();
    }
}


private showToast(type: string, title: string, body: string) {
  this.config = new ToasterConfig({
      positionClass: 'toast-top-center',
      timeout: 0,  // Asegúrate de que timeout esté en 0 para que no se cierre automáticamente
      newestOnTop: true,
      tapToDismiss: false, // Mantén esto en false para que no se cierre al hacer clic
      preventDuplicates: true,
      animation: 'slideDown',
      limit: 5,
  });
  const toast: Toast = {
      type: type, // 'default', 'info', 'success', 'warning', 'error'
      title: title,
      body: body,
      timeout: 15000,  // Esto asegura que la notificación no se cierre automáticamente
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml, // Permite contenido HTML para el botón
  };
  this.toasterService.popAsync(toast);
}

  goToHome() {
    this.router.navigate(['/']);
  }



}
