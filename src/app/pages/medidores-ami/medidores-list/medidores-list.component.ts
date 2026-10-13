import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MedidoresFormComponent } from '../medidores-form/medidores-form.component';
import { MedidoresUploadComponent } from '../medidores-upload/medidores-upload.component';
import { ConsentimientoFormComponent } from '../../consentimiento-form/consentimiento-form.component';
import { LocalDataSource } from 'ng2-smart-table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as moment from 'moment';
import { AngularCsv } from 'angular7-csv/dist/Angular-csv'

import { ConsentimientoService } from '../../../@core/data/services/consentimiento.service';
import { MedidoresService } from '../../../@core/data/services/medidores-ami.service';
import { ExcelServicesService } from '../../../@core/data/excel-services.service';
import { MedidoresView } from '../../../@core/data/models/medidores-ami/medidores-ami_view';
import { Operador } from '../../../@core/data/models/operador/operador';
import { Departamento } from './../../../@core/data/models/departamento';
import { Municipio } from './../../../@core/data/models/municipio';
import { Periodo } from '../../../@core/data/models/general/periodo';
import { Periodoanio } from '../../../@core/data/models/general/periodoanio';
import { TipoEstado } from './../../../@core/data/models/tipo_estado';

@Component({
  selector: 'app-medidores-list',
  templateUrl: './medidores-list.component.html',
  styleUrls: ['./medidores-list.component.scss']
})
export class MedidoresListComponent implements OnInit {
  user_operador: number;
  uid: number;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  excel=[];
  source: LocalDataSource = new LocalDataSource();  

  filtrarForm: FormGroup;
  /*variables para definir los selects de formulario */
  Operador = [];
  Anio = [];
  Periodo = [];
  Departamento = [];
  Municipio = [];

  RowRepotCSV :any;
  csvOptions = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: false,
    showTitle: false,
    title: 'Formato Carga datos :',
    useBom: true,
    noDownload: false,
    headers: ["Identificacion_Operador_Energia","Codigo_Municipio_comercializacion",
              "Medidores_Convencional_Estrato1","Medidores_Convencional_Estrato2","Medidores_Convencional_Estrato3","Medidores_Convencional_Estrato4","Medidores_Convencional_Estrato5",
              "Medidores_Convencional_Estrato6","Medidores_Convencional_Comercial","Medidores_Convencional_Industrial","Medidores_Convencional_Oficial","Medidores_Convencional_Otros_Sectores",
              "Medidores_Prepago_Estrato1","Medidores_Prepago_Estrato2","Medidores_Prepago_Estrato3","Medidores_Prepago_Estrato4","Medidores_Prepago_Estrato5",
              "Medidores_Prepago_Estrato6","Medidores_Prepago_Comercial","Medidores_Prepago_Industrial","Medidores_Prepago_Oficial","Medidores_Prepago_Otros_Sectores",
              "Medidores_Avanzados_Estrato1","Medidores_Avanzados_Estrato2","Medidores_Avanzados_Estrato3","Medidores_Avanzados_Estrato4","Medidores_Avanzados_Estrato5",
              "Medidores_Avanzados_Estrato6","Medidores_Avanzados_Comercial","Medidores_Avanzados_Industrial","Medidores_Avanzados_Oficial","Medidores_Avanzados_Otros_Sectores",
              "Medidores_Fibra_Optica_Estrato1","Medidores_Fibra_Optica_Estrato2","Medidores_Fibra_Optica_Estrato3","Medidores_Fibra_Optica_Estrato4","Medidores_Fibra_Optica_Estrato5",
              "Medidores_Fibra_Optica_Estrato6","Medidores_Fibra_Optica_Comercial","Medidores_Fibra_Optica_Industrial","Medidores_Fibra_Optica_Oficial","Medidores_Fibra_Optica_Otros_Sectores",
              "Medidores_PLC_Estrato1","Medidores_PLC_Estrato2","Medidores_PLC_Estrato3","Medidores_PLC_Estrato4","Medidores_PLC_Estrato5",
              "Medidores_PLC_Estrato6","Medidores_PLC_Comercial","Medidores_PLC_Industrial","Medidores_PLC_Oficial","Medidores_PLC_Otros_Sectores",
              "Medidores_RF_Estrato1","Medidores_RF_Estrato2","Medidores_RF_Estrato3","Medidores_RF_Estrato4","Medidores_RF_Estrato5",
              "Medidores_RF_Estrato6","Medidores_RF_Comercial","Medidores_RF_Industrial","Medidores_RF_Oficial","Medidores_RF_Otros_Sectores",
              "Medidores_GPRS_3G_4G_Estrato1","Medidores_GPRS_3G_4G_Estrato2","Medidores_GPRS_3G_4G_Estrato3","Medidores_GPRS_3G_4G_Estrato4","Medidores_GPRS_3G_4G_Estrato5",
              "Medidores_GPRS_3G_4G_Estrato6","Medidores_GPRS_3G_4G_Comercial","Medidores_GPRS_3G_4G_Industrial","Medidores_GPRS_3G_4G_Oficial","Medidores_GPRS_3G_4G_Otros_Sectores",
              "Medidores_LPWAN_Estrato1","Medidores_LPWAN_Estrato2","Medidores_LPWAN_Estrato3","Medidores_LPWAN_Estrato4","Medidores_LPWAN_Estrato5",
              "Medidores_LPWAN_Estrato6","Medidores_LPWAN_Comercial","Medidores_LPWAN_Industrial","Medidores_LPWAN_Oficial","Medidores_LPWAN_Otros_Sectores",
              "Medidores_Otro_Medio_Estrato1","Medidores_Otro_Medio_Estrato2","Medidores_Otro_Medio_Estrato3","Medidores_Otro_Medio_Estrato4","Medidores_Otro_Medio_Estrato5",
              "Medidores_Otro_Medio_Estrato6","Medidores_Otro_Medio_Comercial","Medidores_Otro_Medio_Industrial","Medidores_Otro_Medio_Oficial","Medidores_Otro_Medio_Otros_Sectores"
            ]



  };


  constructor(private modalService: NgbModal, private translate: TranslateService, private registroService: MedidoresService,
      private toasterService: ToasterService, private excelService:ExcelServicesService,
      private formBuilder: FormBuilder) {
    this.load_UserData();
    this.construirForm();
    this.loadOptionsOperador();
    this.loadOptionsAnio();
    this.loadOptionsPeriodo();
    this.loadOptionsDepartamento();
    //this.loadData();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  construirForm() {
    this.filtrarForm = this.formBuilder.group({
      Operador: [null],
      Anio: [null],
      Trimestre: [{ value: "", disabled: true }],
      Periodo: [null],
      Departamento: [null],
      Municipio: [{ value: "", disabled: true }],
    });
  }
    
  downloadCSV(){
    //this.RowRepotCSV : JSONDATA , HolidayList : CSV file Name, this.csvOptions : file options
    new  AngularCsv(this.RowRepotCSV, "FormatoReporteMedidores", this.csvOptions);
  }

  download(){
    var files = 'assets/formatos/Formato_Reporte_MedidoresAMI.xlsx';
    window.location.href=files
  }

  cargarCampos() {
    //deshabilita botones usuarios no operador
    let permiso=true;
    if(this.user_operador===0)
        {permiso=false;}

    this.settings = {
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      /*edit: {
        editButtonContent: '<i class="nb-edit"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },*/
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      actions: { add: permiso,edit: false,delete: permiso},
      mode: 'external',
      columns: {
        // Id: {
        //   title: this.translate.instant('GLOBAL.operador.id'),
        //   // type: 'number;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        Operador: {
          title: this.translate.instant('GLOBAL.medidoresami.operador'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value.Nombreoperador? value.Nombreoperador : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Nombreoperador + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Periodo: {
          title: this.translate.instant('GLOBAL.medidoresami.periodo'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Departamento: {
          title: this.translate.instant('GLOBAL.medidoresami.departamento'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value.NombreDepartamento? value.NombreDepartamento : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Nombredepartamento + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Municipio: {
          title: this.translate.instant('GLOBAL.medidoresami.municipio'),
          // type: 'tipo_estado;',
          valuePrepareFunction: (value) => {
            return value.NombreMunicipio? value.NombreMunicipio : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Nombremunicipio + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Estadoreporte: {
          title: this.translate.instant('GLOBAL.medidoresami.estadoreporte'),
          // type: 'tipo_estado;',
          valuePrepareFunction: (value) => {
            return value.NombreEstado ? value.NombreEstado : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreEstado + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Fechacreacion: {
          title: this.translate.instant('GLOBAL.medidoresami.fechacreacion'),
          // type: 'Date;',
          valuePrepareFunction: (value) => {
            return moment(value).format('YYYY/MM/DD');
          },
        },

        MedConvEst1_1_1: {
          title: this.translate.instant('GLOBAL.medidoresami.TituloMedConv')+' '+this.translate.instant('GLOBAL.medidoresami.MedConvEst1_1_1'),
           // type: 'string;',
           valuePrepareFunction: (value) => {
            return value;
          },
        },

        MedConvEst2_1_2: {
          title: this.translate.instant('GLOBAL.medidoresami.TituloMedConv')+' '+this.translate.instant('GLOBAL.medidoresami.MedConvEst2_1_2'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
           return value;
         },
       },

       MedConvEst3_1_3: {
        title: this.translate.instant('GLOBAL.medidoresami.TituloMedConv')+' '+this.translate.instant('GLOBAL.medidoresami.MedConvEst3_1_3'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedConvEst4_1_4: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedConv')+' '+this.translate.instant('GLOBAL.medidoresami.MedConvEst4_1_4'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedConvEst5_1_5: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedConv')+' '+this.translate.instant('GLOBAL.medidoresami.MedConvEst5_1_5'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedConvEst6_1_6: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedConv')+' '+this.translate.instant('GLOBAL.medidoresami.MedConvEst6_1_6'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedConvCom_1_7: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedConv')+' '+this.translate.instant('GLOBAL.medidoresami.MedConvCom_1_7'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedConvInd_1_8: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedConv')+' '+this.translate.instant('GLOBAL.medidoresami.MedConvInd_1_8'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedConvOfc_1_9: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedConv')+' '+this.translate.instant('GLOBAL.medidoresami.MedConvOfc_1_9'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedConvOtr_1_10: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedConv')+' '+this.translate.instant('GLOBAL.medidoresami.MedConvOtr_1_10'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     
     MedPrepEst1_2_1: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPrep')+' '+this.translate.instant('GLOBAL.medidoresami.MedPrepEst1_2_1'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedPrepEst2_2_2: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPrep')+' '+this.translate.instant('GLOBAL.medidoresami.MedPrepEst2_2_2'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedPrepEst3_2_3: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPrep')+' '+this.translate.instant('GLOBAL.medidoresami.MedPrepEst3_2_3'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedPrepEst4_2_4: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPrep')+' '+this.translate.instant('GLOBAL.medidoresami.MedPrepEst4_2_4'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedPrepEst5_2_5: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPrep')+' '+this.translate.instant('GLOBAL.medidoresami.MedPrepEst5_2_5'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedPrepEst6_2_6: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPrep')+' '+this.translate.instant('GLOBAL.medidoresami.MedPrepEst6_2_6'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedPrepCom_2_7: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPrep')+' '+this.translate.instant('GLOBAL.medidoresami.MedPrepCom_2_7'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedPrepInd_2_8: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPrep')+' '+this.translate.instant('GLOBAL.medidoresami.MedPrepInd_2_8'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },


     MedPrepOfc_2_9: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPrep')+' '+this.translate.instant('GLOBAL.medidoresami.MedPrepOfc_2_9'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedPrepOtr_2_10: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPrep')+' '+this.translate.instant('GLOBAL.medidoresami.MedPrepOtr_2_10'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     
     MedAvanEst1_3_1: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedAvan')+' '+this.translate.instant('GLOBAL.medidoresami.MedAvanEst1_3_1'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedAvanEst2_3_2: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedAvan')+' '+this.translate.instant('GLOBAL.medidoresami.MedAvanEst2_3_2'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedAvanEst3_3_3: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedAvan')+' '+this.translate.instant('GLOBAL.medidoresami.MedAvanEst3_3_3'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedAvanEst4_3_4: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedAvan')+' '+this.translate.instant('GLOBAL.medidoresami.MedAvanEst4_3_4'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedAvanEst5_3_5: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedAvan')+' '+this.translate.instant('GLOBAL.medidoresami.MedAvanEst5_3_5'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedAvanEst6_3_6: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedAvan')+' '+this.translate.instant('GLOBAL.medidoresami.MedAvanEst6_3_6'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedAvanCom_3_7: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedAvan')+' '+this.translate.instant('GLOBAL.medidoresami.MedAvanCom_3_7'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedAvanInd_3_8: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedAvan')+' '+this.translate.instant('GLOBAL.medidoresami.MedAvanInd_3_8'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedAvanOfc_3_9: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedAvan')+' '+this.translate.instant('GLOBAL.medidoresami.MedAvanOfc_3_9'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedAvanOtr_3_10: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedAvan')+' '+this.translate.instant('GLOBAL.medidoresami.MedAvanOtr_3_10'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     
     MedFoptEst1_4_1: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedAvan')+' '+this.translate.instant('GLOBAL.medidoresami.MedFoptEst1_4_1'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedFoptEst2_4_2: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedFopt')+' '+this.translate.instant('GLOBAL.medidoresami.MedFoptEst2_4_2'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedFoptEst3_4_3: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedFopt')+' '+this.translate.instant('GLOBAL.medidoresami.MedFoptEst3_4_3'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedFoptEst4_4_4: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedFopt')+' '+this.translate.instant('GLOBAL.medidoresami.MedFoptEst4_4_4'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedFoptEst5_4_5: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedFopt')+' '+this.translate.instant('GLOBAL.medidoresami.MedFoptEst5_4_5'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedFoptEst6_4_6: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedFopt')+' '+this.translate.instant('GLOBAL.medidoresami.MedFoptEst6_4_6'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedFoptCom_4_7: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedFopt')+' '+this.translate.instant('GLOBAL.medidoresami.MedFoptCom_4_7'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedFoptInd_4_8: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedFopt')+' '+this.translate.instant('GLOBAL.medidoresami.MedFoptInd_4_8'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedFoptOfc_4_9: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedFopt')+' '+this.translate.instant('GLOBAL.medidoresami.MedFoptOfc_4_9'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedFoptOtr_4_10: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedFopt')+' '+this.translate.instant('GLOBAL.medidoresami.MedFoptOtr_4_10'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     
     MedPLCEst1_5_1: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPLC')+' '+this.translate.instant('GLOBAL.medidoresami.MedPLCEst1_5_1'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedPLCEst2_5_2: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPLC')+' '+this.translate.instant('GLOBAL.medidoresami.MedPLCEst2_5_2'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedPLCEst3_5_3: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPLC')+' '+this.translate.instant('GLOBAL.medidoresami.MedPLCEst3_5_3'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedPLCEst4_5_4: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPLC')+' '+this.translate.instant('GLOBAL.medidoresami.MedPLCEst4_5_4'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedPLCEst5_5_5: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPLC')+' '+this.translate.instant('GLOBAL.medidoresami.MedPLCEst5_5_5'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedPLCEst6_5_6: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPLC')+' '+this.translate.instant('GLOBAL.medidoresami.MedPLCEst6_5_6'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedPLCCom_5_7: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPLC')+' '+this.translate.instant('GLOBAL.medidoresami.MedPLCCom_5_7'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedPLCInd_5_8: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPLC')+' '+this.translate.instant('GLOBAL.medidoresami.MedPLCInd_5_8'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedPLCOfc_5_9: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPLC')+' '+this.translate.instant('GLOBAL.medidoresami.MedPLCOfc_5_9'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedPLCOtr_5_10: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedPLC')+' '+this.translate.instant('GLOBAL.medidoresami.MedPLCOtr_5_10'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     
     MedRFEst1_6_1: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedRF')+' '+this.translate.instant('GLOBAL.medidoresami.MedRFEst1_6_1'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedRFEst2_6_2: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedRF')+' '+this.translate.instant('GLOBAL.medidoresami.MedRFEst2_6_2'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedRFEst3_6_3: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedRF')+' '+this.translate.instant('GLOBAL.medidoresami.MedRFEst3_6_3'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedRFEst4_6_4: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedRF')+' '+this.translate.instant('GLOBAL.medidoresami.MedRFEst4_6_4'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedRFEst5_6_5: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedRF')+' '+this.translate.instant('GLOBAL.medidoresami.MedRFEst5_6_5'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedRFEst6_6_6: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedRF')+' '+this.translate.instant('GLOBAL.medidoresami.MedRFEst6_6_6'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedRFCom_6_7: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedRF')+' '+this.translate.instant('GLOBAL.medidoresami.MedRFCom_6_7'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedRFInd_6_8: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedRF')+' '+this.translate.instant('GLOBAL.medidoresami.MedRFInd_6_8'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedRFOfc_6_9: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedRF')+' '+this.translate.instant('GLOBAL.medidoresami.MedRFOfc_6_9'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedRFOtr_6_10: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedRF')+' '+this.translate.instant('GLOBAL.medidoresami.MedRFOtr_6_10'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     
     MedGPRSEst1_7_1: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedGPRS')+' '+this.translate.instant('GLOBAL.medidoresami.MedGPRSEst1_7_1'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedGPRSEst2_7_2: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedGPRS')+' '+this.translate.instant('GLOBAL.medidoresami.MedGPRSEst2_7_2'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedGPRSEst3_7_3: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedGPRS')+' '+this.translate.instant('GLOBAL.medidoresami.MedGPRSEst3_7_3'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedGPRSEst4_7_4: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedGPRS')+' '+this.translate.instant('GLOBAL.medidoresami.MedGPRSEst4_7_4'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedGPRSEst5_7_5: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedGPRS')+' '+this.translate.instant('GLOBAL.medidoresami.MedGPRSEst5_7_5'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedGPRSEst6_7_6: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedGPRS')+' '+this.translate.instant('GLOBAL.medidoresami.MedGPRSEst6_7_6'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedGPRSCom_7_7: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedGPRS')+' '+this.translate.instant('GLOBAL.medidoresami.MedGPRSCom_7_7'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedGPRSInd_7_8: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedGPRS')+' '+this.translate.instant('GLOBAL.medidoresami.MedGPRSInd_7_8'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedGPRSOfc_7_9: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedGPRS')+' '+this.translate.instant('GLOBAL.medidoresami.MedGPRSOfc_7_9'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedGPRSOtr_7_10: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedGPRS')+' '+this.translate.instant('GLOBAL.medidoresami.MedGPRSOtr_7_10'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     
     MedLPWANEst1_8_1: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedLPWAN')+' '+this.translate.instant('GLOBAL.medidoresami.MedLPWANEst1_8_1'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedLPWANEst2_8_2: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedLPWAN')+' '+this.translate.instant('GLOBAL.medidoresami.MedLPWANEst2_8_2'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedLPWANEst3_8_3: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedLPWAN')+' '+this.translate.instant('GLOBAL.medidoresami.MedLPWANEst3_8_3'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedLPWANEst4_8_4: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedLPWAN')+' '+this.translate.instant('GLOBAL.medidoresami.MedLPWANEst4_8_4'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedLPWANEst5_8_5: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedLPWAN')+' '+this.translate.instant('GLOBAL.medidoresami.MedLPWANEst5_8_5'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedLPWANEst6_8_6: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedLPWAN')+' '+this.translate.instant('GLOBAL.medidoresami.MedLPWANEst6_8_6'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedLPWANCom_8_7: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedLPWAN')+' '+this.translate.instant('GLOBAL.medidoresami.MedLPWANCom_8_7'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedLPWANInd_8_8: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedLPWAN')+' '+this.translate.instant('GLOBAL.medidoresami.MedLPWANInd_8_8'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedLPWANOfc_8_9: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedLPWAN')+' '+this.translate.instant('GLOBAL.medidoresami.MedLPWANOfc_8_9'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedLPWANOtr_8_10: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedLPWAN')+' '+this.translate.instant('GLOBAL.medidoresami.MedLPWANOtr_8_10'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     
     MedOtroEst1_9_1: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedLPWAN')+' '+this.translate.instant('GLOBAL.medidoresami.MedOtroEst1_9_1'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedOtroEst2_9_2: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedLPWAN')+' '+this.translate.instant('GLOBAL.medidoresami.MedOtroEst2_9_2'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedOtroEst3_9_3: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedOtro')+' '+this.translate.instant('GLOBAL.medidoresami.MedOtroEst3_9_3'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedOtroEst4_9_4: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedOtro')+' '+this.translate.instant('GLOBAL.medidoresami.MedOtroEst4_9_4'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedOtroEst5_9_5: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedOtro')+' '+this.translate.instant('GLOBAL.medidoresami.MedOtroEst5_9_5'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedOtroEst6_9_6: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedOtro')+' '+this.translate.instant('GLOBAL.medidoresami.MedOtroEst6_9_6'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedOtroCom_9_7: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedOtro')+' '+this.translate.instant('GLOBAL.medidoresami.MedOtroCom_9_7'),
        // type: 'string;',
        valuePrepareFunction: (value) => {
         return value;
       },
     },

     MedOtroInd_9_8: {
      title: this.translate.instant('GLOBAL.medidoresami.TituloMedOtro')+' '+this.translate.instant('GLOBAL.medidoresami.MedOtroInd_9_8'),
      // type: 'string;',
      valuePrepareFunction: (value) => {
       return value;
        },
      },

      MedOtroOfc_9_9: {
        title: this.translate.instant('GLOBAL.medidoresami.TituloMedOtro')+' '+this.translate.instant('GLOBAL.medidoresami.MedOtroOfc_9_9'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
          return value;
        },
      },

      MedOtroOtr_9_10: {
        title: this.translate.instant('GLOBAL.medidoresami.TituloMedOtro')+' '+this.translate.instant('GLOBAL.medidoresami.MedOtroOtr_9_10'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
          return value;
        },
      },

      Observacion: {
        title: this.translate.instant('GLOBAL.medidoresami.Observacion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
          return value;
        },
      },

      },
    };
  }

  load_UserData(): void {
    // rescata el idoperador asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
      this.user_operador = user.operador;
      this.uid = user.id;
    });
    //console.info(this.user_operador);
  }  

  compareById(o1,o2){
    if(o1 == null || o2 == null){
      return false;
    }
    return o1.Id === o2.Id;
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
              this.filtrarForm.patchValue(operador);
            }
        }
      });
  }  

  loadOptionsAnio(): void {
    this.registroService.get('periodoanioami')
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          this.Anio = <Array<Periodoanio>>res;
        }
      });
  } 


  loadOptionsTrimestre(): void {
    
      let trimestre={"Id":"","Trimestre":""};
      this.filtrarForm.patchValue(trimestre);
       //habilitar el campo
       this.filtrarForm.get('Trimestre').enable();
 
   } 

  loadOptionsPeriodo(): void {
    let periodo: Array<any> = [];
    this.registroService.get('periodoami')
      .subscribe(res => {
        if (res !== null) {
         // console.info(res);
          this.Periodo = <Array<Periodo>>res;
        }
      });
  }   

  loadOptionsDepartamento(): void {
    this.registroService.get('departamento')
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          this.Departamento = <Array<Departamento>>res;
        }
      });
  }    

  loadOptionsMunicipio(): void {

    this.filtrarForm.get('Municipio').enable();
    this.registroService.get('municipio')
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          this.Municipio = <Array<Municipio>>res;
        }
      });
  }   
  
  selectMunicipio()
  {   
    let municipio: any=Municipio;
      let selecion=this.filtrarForm.get('Departamento').value;
      this.registroService.get('municipio/na/'+selecion.Id)
      .subscribe(res => {
        if (res !== null) {
          this.Municipio = <Array<Municipio>>res;
          //se selleciona la opcion por defecto
          //municipio.Municipio=this.Municipio[0];
          municipio.Municipio=0;
          this.filtrarForm.patchValue(municipio);
          //habilitar el campo
          this.filtrarForm.get('Municipio').enable();
        }
      });
  }

  Limpiar()
  {   
      let limpiar={"Departamento":null,"Municipio":null,"Periodo":null,"Anio":null,"Trimestre":null,};
      if(this.user_operador==0) {
             limpiar["Operador"]=null;
            }
      this.filtrarForm.patchValue(limpiar);
      this.filtrarForm.get('Municipio').disable();
      this.filtrarForm.get('Trimestre').disable();
  }


  loadData(): void {
    
    let filtros = this.filtrarForm.value;
    let operador=0;
    let periodo=0;
    let depto=0;
    let municipio=0;
    let parametro='';
    //console.log(filtros)
    if(this.user_operador!==0)
      {operador=this.user_operador;}
    else if(filtros.Operador!==null)
      {operador=filtros.Operador.Id;}
    if(filtros.Periodo!==null)
      {periodo=filtros.Periodo.Id;}
    if(filtros.Departamento!==null)
      {depto=filtros.Departamento.Id;
       municipio=filtros.Municipio.Id;}
    if(filtros.Anio!==null)
       {parametro= '?trimestre='+filtros.Anio.Id+filtros.Trimestre;}
    // '/reporteami/:id?/:id_operador?/:periodo?/:id_departamento?/:id_municipio?'
    // this.registroService.get('reporteami/0/'+this.user_operador+'/').subscribe(res => {
    this.registroService.get('reporteami/0/'+operador+'/'+periodo+'/'+depto+'/'+municipio+'/'+parametro).subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        //console.log(data);
        let datos= []

        for(var i = 0; i < data.length;i++){
           // this.excel
            data[i].MedConvEst1_1_1=data[i].Medidores.MedConvEst1_1_1;  
            data[i].MedConvEst2_1_2=data[i].Medidores.MedConvEst2_1_2;  
            data[i].MedConvEst3_1_3=data[i].Medidores.MedConvEst3_1_3;  
            data[i].MedConvEst4_1_4=data[i].Medidores.MedConvEst4_1_4;  
            data[i].MedConvEst5_1_5=data[i].Medidores.MedConvEst5_1_5;  
            data[i].MedConvEst6_1_6=data[i].Medidores.MedConvEst6_1_6;  
            data[i].MedConvCom_1_7=data[i].Medidores.MedConvCom_1_7;  
            data[i].MedConvInd_1_8=data[i].Medidores.MedConvInd_1_8;  
            data[i].MedConvOfc_1_9=data[i].Medidores.MedConvOfc_1_9;  
            data[i].MedConvOtr_1_10=data[i].Medidores.MedConvOtr_1_10;

            data[i].MedPrepEst1_2_1=data[i].Medidores.MedPrepEst1_2_1;  
            data[i].MedPrepEst2_2_2=data[i].Medidores.MedPrepEst2_2_2;  
            data[i].MedPrepEst3_2_3=data[i].Medidores.MedPrepEst3_2_3;  
            data[i].MedPrepEst4_2_4=data[i].Medidores.MedPrepEst4_2_4;  
            data[i].MedPrepEst5_2_5=data[i].Medidores.MedPrepEst5_2_5;  
            data[i].MedPrepEst6_2_6=data[i].Medidores.MedPrepEst6_2_6;  
            data[i].MedPrepCom_2_7=data[i].Medidores.MedPrepCom_2_7;  
            data[i].MedPrepInd_2_8=data[i].Medidores.MedPrepInd_2_8;  
            data[i].MedPrepOfc_2_9=data[i].Medidores.MedPrepOfc_2_9;  
            data[i].MedPrepOtr_2_10=data[i].Medidores.MedPrepOtr_2_10;  
            
            data[i].MedAvanEst1_3_1=data[i].Medidores.MedAvanEst1_3_1;  
            data[i].MedAvanEst2_3_2=data[i].Medidores.MedAvanEst2_3_2;  
            data[i].MedAvanEst3_3_3=data[i].Medidores.MedAvanEst3_3_3;  
            data[i].MedAvanEst4_3_4=data[i].Medidores.MedAvanEst4_3_4;  
            data[i].MedAvanEst5_3_5=data[i].Medidores.MedAvanEst5_3_5;  
            data[i].MedAvanEst6_3_6=data[i].Medidores.MedAvanEst6_3_6;  
            data[i].MedAvanCom_3_7=data[i].Medidores.MedAvanCom_3_7;  
            data[i].MedAvanInd_3_8=data[i].Medidores.MedAvanInd_3_8;  
            data[i].MedAvanOfc_3_9=data[i].Medidores.MedAvanOfc_3_9;  
            data[i].MedAvanOtr_3_10=data[i].Medidores.MedAvanOtr_3_10;  
            
            data[i].MedFoptEst1_4_1=data[i].Medidores.MedFoptEst1_4_1;  
            data[i].MedFoptEst2_4_2=data[i].Medidores.MedFoptEst2_4_2;  
            data[i].MedFoptEst3_4_3=data[i].Medidores.MedFoptEst3_4_3;  
            data[i].MedFoptEst4_4_4=data[i].Medidores.MedFoptEst4_4_4;  
            data[i].MedFoptEst5_4_5=data[i].Medidores.MedFoptEst5_4_5;  
            data[i].MedFoptEst6_4_6=data[i].Medidores.MedFoptEst6_4_6;  
            data[i].MedFoptCom_4_7=data[i].Medidores.MedFoptCom_4_7;  
            data[i].MedFoptInd_4_8=data[i].Medidores.MedFoptInd_4_8;  
            data[i].MedFoptOfc_4_9=data[i].Medidores.MedFoptOfc_4_9;  
            data[i].MedFoptOtr_4_10=data[i].Medidores.MedFoptOtr_4_10;  
            
            data[i].MedPLCEst1_5_1=data[i].Medidores.MedPLCEst1_5_1;  
            data[i].MedPLCEst2_5_2=data[i].Medidores.MedPLCEst2_5_2;  
            data[i].MedPLCEst3_5_3=data[i].Medidores.MedPLCEst3_5_3;  
            data[i].MedPLCEst4_5_4=data[i].Medidores.MedPLCEst4_5_4;  
            data[i].MedPLCEst5_5_5=data[i].Medidores.MedPLCEst5_5_5;  
            data[i].MedPLCEst6_5_6=data[i].Medidores.MedPLCEst6_5_6;  
            data[i].MedPLCCom_5_7=data[i].Medidores.MedPLCCom_5_7;  
            data[i].MedPLCInd_5_8=data[i].Medidores.MedPLCInd_5_8;  
            data[i].MedPLCOfc_5_9=data[i].Medidores.MedPLCOfc_5_9;  
            data[i].MedPLCOtr_5_10=data[i].Medidores.MedPLCOtr_5_10;  
            
            data[i].MedRFEst1_6_1=data[i].Medidores.MedRFEst1_6_1;  
            data[i].MedRFEst2_6_2=data[i].Medidores.MedRFEst2_6_2;  
            data[i].MedRFEst3_6_3=data[i].Medidores.MedRFEst3_6_3;  
            data[i].MedRFEst4_6_4=data[i].Medidores.MedRFEst4_6_4;  
            data[i].MedRFEst5_6_5=data[i].Medidores.MedRFEst5_6_5;  
            data[i].MedRFEst6_6_6=data[i].Medidores.MedRFEst6_6_6;  
            data[i].MedRFCom_6_7=data[i].Medidores.MedRFCom_6_7;  
            data[i].MedRFInd_6_8=data[i].Medidores.MedRFInd_6_8;  
            data[i].MedRFOfc_6_9=data[i].Medidores.MedRFOfc_6_9;  
            data[i].MedRFOtr_6_10=data[i].Medidores.MedRFOtr_6_10;  
            
            data[i].MedGPRSEst1_7_1=data[i].Medidores.MedGPRSEst1_7_1;  
            data[i].MedGPRSEst2_7_2=data[i].Medidores.MedGPRSEst2_7_2;  
            data[i].MedGPRSEst3_7_3=data[i].Medidores.MedGPRSEst3_7_3;  
            data[i].MedGPRSEst4_7_4=data[i].Medidores.MedGPRSEst4_7_4;  
            data[i].MedGPRSEst5_7_5=data[i].Medidores.MedGPRSEst5_7_5;  
            data[i].MedGPRSEst6_7_6=data[i].Medidores.MedGPRSEst6_7_6;  
            data[i].MedGPRSCom_7_7=data[i].Medidores.MedGPRSCom_7_7;  
            data[i].MedGPRSInd_7_8=data[i].Medidores.MedGPRSInd_7_8;   
            data[i].MedGPRSOfc_7_9=data[i].Medidores.MedGPRSOfc_7_9;  
            data[i].MedGPRSOtr_7_10=data[i].Medidores.MedGPRSOtr_7_10; 
            
            data[i].MedLPWANEst1_8_1=data[i].Medidores.MedLPWANEst1_8_1;  
            data[i].MedLPWANEst2_8_2=data[i].Medidores.MedLPWANEst2_8_2;  
            data[i].MedLPWANEst3_8_3=data[i].Medidores.MedLPWANEst3_8_3;  
            data[i].MedLPWANEst4_8_4=data[i].Medidores.MedLPWANEst4_8_4;  
            data[i].MedLPWANEst5_8_5=data[i].Medidores.MedLPWANEst5_8_5;  
            data[i].MedLPWANEst6_8_6=data[i].Medidores.MedLPWANEst6_8_6;  
            data[i].MedLPWANCom_8_7=data[i].Medidores.MedLPWANCom_8_7;  
            data[i].MedLPWANInd_8_8=data[i].Medidores.MedLPWANInd_8_8;  
            data[i].MedLPWANOfc_8_9=data[i].Medidores.MedLPWANOfc_8_9;  
            data[i].MedLPWANOtr_8_10=data[i].Medidores.MedLPWANOtr_8_10;  
            
            data[i].MedOtroEst1_9_1=data[i].Medidores.MedOtroEst1_9_1;  
            data[i].MedOtroEst2_9_2=data[i].Medidores.MedOtroEst2_9_2;  
            data[i].MedOtroEst3_9_3=data[i].Medidores.MedOtroEst3_9_3;  
            data[i].MedOtroEst4_9_4=data[i].Medidores.MedOtroEst4_9_4;  
            data[i].MedOtroEst5_9_5=data[i].Medidores.MedOtroEst5_9_5;  
            data[i].MedOtroEst6_9_6=data[i].Medidores.MedOtroEst6_9_6;  
            data[i].MedOtroCom_9_7=data[i].Medidores.MedOtroCom_9_7;  
            data[i].MedOtroInd_9_8=data[i].Medidores.MedOtroInd_9_8;  
            data[i].MedOtroOfc_9_9=data[i].Medidores.MedOtroOfc_9_9;  
            data[i].MedOtroOtr_9_10=data[i].Medidores.MedOtroOtr_9_10;  
            data[i].Observacion=data[i].Medidores.Observacion;

            }
             
        // console.info(data);
         this.source.load(data);
        //PARA EXPORTAR EXCEL
        this.excel=[];
        let arrayText:any;
        data.forEach(row => {

        let momentVariable = moment(row.Fechacreacion, 'YYYY-MM-DD')  
        //  console.info(momentVariable.format('YYYY-MM-DD'))
        arrayText = {
            Operador_Enegia: row.Operador.Nombreoperador,
            Periodo_Reporte: row.Periodo,
            Departamento_comercialización:  row.Departamento.NombreDepartamento ,
	          Municipio_comercialización:  row.Municipio.NombreMunicipio,
            Fecha_reporte: momentVariable.format('YYYY-MM-DD'),
            //Fecha_reporte:  row.Fechacreacion ,
            Medidores_Convencional_Estrato1:  parseInt(row.MedConvEst1_1_1),
            Medidores_Convencional_Estrato2:  parseInt(row.MedConvEst2_1_2),
            Medidores_Convencional_Estrato3:  parseInt(row.MedConvEst3_1_3),
            Medidores_Convencional_Estrato4:  parseInt(row.MedConvEst4_1_4),
            Medidores_Convencional_Estrato5:  parseInt(row.MedConvEst5_1_5),
            Medidores_Convencional_Estrato6:  parseInt(row.MedConvEst6_1_6),
            Medidores_Convencional_Comercial:  parseInt(row.MedConvCom_1_7),
            Medidores_Convencional_Industrial:  parseInt(row.MedConvInd_1_8),
            Medidores_Convencional_Oficial:  parseInt(row.MedConvOfc_1_9),
            Medidores_Convencional_Otros_Sectores:  parseInt(row.MedConvOtr_1_10),

            Medidores_Prepago_Estrato1:  parseInt(row.MedPrepEst1_2_1),
            Medidores_Prepago_Estrato2:  parseInt(row.MedPrepEst2_2_2),
            Medidores_Prepago_Estrato3:  parseInt(row.MedPrepEst3_2_3),
            Medidores_Prepago_Estrato4:  parseInt(row.MedPrepEst4_2_4),
            Medidores_Prepago_Estrato5:  parseInt(row.MedPrepEst5_2_5),
            Medidores_Prepago_Estrato6:  parseInt(row.MedPrepEst6_2_6),
            Medidores_Prepago_Comercial:  parseInt(row.MedPrepCom_2_7),
            Medidores_Prepago_Industrial:  parseInt(row.MedPrepInd_2_8),
            Medidores_Prepago_Oficial:  parseInt(row.MedPrepOfc_2_9),
            Medidores_Prepago_Otros_Sectores:  parseInt(row.MedPrepOtr_2_10),

            Medidores_Avanzados_Estrato1:  parseInt(row.MedAvanEst1_3_1),
            Medidores_Avanzados_Estrato2:  parseInt(row.MedAvanEst2_3_2),
            Medidores_Avanzados_Estrato3:  parseInt(row.MedAvanEst3_3_3),
            Medidores_Avanzados_Estrato4:  parseInt(row.MedAvanEst4_3_4),
            Medidores_Avanzados_Estrato5:  parseInt(row.MedAvanEst5_3_5),
            Medidores_Avanzados_Estrato6:  parseInt(row.MedAvanEst6_3_6),
            Medidores_Avanzados_Comercial:  parseInt(row.MedAvanCom_3_7),
            Medidores_Avanzados_Industrial:  parseInt(row.MedAvanInd_3_8),
            Medidores_Avanzados_Oficial:  parseInt(row.MedAvanOfc_3_9),
            Medidores_Avanzados_Otros_Sectores:  parseInt(row.MedAvanOtr_3_10),

            Medidores_Fibra_Optica_Estrato1:  parseInt(row.MedFoptEst1_4_1),
            Medidores_Fibra_Optica_Estrato2:  parseInt(row.MedFoptEst2_4_2),
            Medidores_Fibra_Optica_Estrato3:  parseInt(row.MedFoptEst3_4_3),
            Medidores_Fibra_Optica_Estrato4:  parseInt(row.MedFoptEst4_4_4),
            Medidores_Fibra_Optica_Estrato5:  parseInt(row.MedFoptEst5_4_5),
            Medidores_Fibra_Optica_Estrato6:  parseInt(row.MedFoptEst6_4_6),
            Medidores_Fibra_Optica_Comercial:  parseInt(row.MedFoptCom_4_7),
            Medidores_Fibra_Optica_Industrial:  parseInt(row.MedFoptInd_4_8),
            Medidores_Fibra_Optica_Oficial:  parseInt(row.MedFoptOfc_4_9),
            Medidores_Fibra_Optica_Otros_Sectores:  parseInt(row.MedFoptOtr_4_10),

            Medidores_PLC_Estrato1:  parseInt(row.MedPLCEst1_5_1),
            Medidores_PLC_Estrato2:  parseInt(row.MedPLCEst2_5_2),
            Medidores_PLC_Estrato3:  parseInt(row.MedPLCEst3_5_3),
            Medidores_PLC_Estrato4:  parseInt(row.MedPLCEst4_5_4),
            Medidores_PLC_Estrato5:  parseInt(row.MedPLCEst5_5_5),
            Medidores_PLC_Estrato6:  parseInt(row.MedPLCEst6_5_6),            
            Medidores_PLC_Comercial:  parseInt(row.MedPLCCom_5_7),
            Medidores_PLC_Industrial:  parseInt(row.MedPLCInd_5_8),
            Medidores_PLC_Oficial:  parseInt(row.MedPLCOfc_5_9),
            Medidores_PLC_Otros_Sectores:  parseInt(row.MedPLCOtr_5_10),

            Medidores_RF_Estrato1:  parseInt(row.MedRFEst1_6_1),
            Medidores_RF_Estrato2:  parseInt(row.MedRFEst2_6_2),
            Medidores_RF_Estrato3:  parseInt(row.MedRFEst3_6_3),
            Medidores_RF_Estrato4:  parseInt(row.MedRFEst4_6_4),
            Medidores_RF_Estrato5:  parseInt(row.MedRFEst5_6_5),
            Medidores_RF_Estrato6:  parseInt(row.MedRFEst6_6_6),
            Medidores_RF_Comercial:  parseInt(row.MedRFCom_6_7),
            Medidores_RF_Industrial:  parseInt(row.MedRFInd_6_8),
            Medidores_RF_Oficial:  parseInt(row.MedRFOfc_6_9),
            Medidores_RF_Otros_Sectores:  parseInt(row.MedRFOtr_6_10),

            Medidores_GPRS_3G_4G_Estrato1:  parseInt(row.MedGPRSEst1_7_1),
            Medidores_GPRS_3G_4G_Estrato2:  parseInt(row.MedGPRSEst2_7_2),
            Medidores_GPRS_3G_4G_Estrato3:  parseInt(row.MedGPRSEst3_7_3),
            Medidores_GPRS_3G_4G_Estrato4:  parseInt(row.MedGPRSEst4_7_4),
            Medidores_GPRS_3G_4G_Estrato5:  parseInt(row.MedGPRSEst5_7_5),
            Medidores_GPRS_3G_4G_Estrato6:  parseInt(row.MedGPRSEst6_7_6),
            Medidores_GPRS_3G_4G_Comercial:  parseInt(row.MedGPRSCom_7_7),
            Medidores_GPRS_3G_4G_Industrial:  parseInt(row.MedGPRSInd_7_8),
            Medidores_GPRS_3G_4G_Oficial:  parseInt(row.MedGPRSOfc_7_9),
            Medidores_GPRS_3G_4G_Otros_Sectores:  parseInt(row.MedGPRSOtr_7_10),

            Medidores_LPWAN_Estrato1:  parseInt(row.MedLPWANEst1_8_1),
            Medidores_LPWAN_Estrato2:  parseInt(row.MedLPWANEst2_8_2),
            Medidores_LPWAN_Estrato3:  parseInt(row.MedLPWANEst3_8_3),
            Medidores_LPWAN_Estrato4:  parseInt(row.MedLPWANEst4_8_4),
            Medidores_LPWAN_Estrato5:  parseInt(row.MedLPWANEst5_8_5),
            Medidores_LPWAN_Estrato6:  parseInt(row.MedLPWANEst6_8_6),
            Medidores_LPWAN_Comercial:  parseInt(row.MedLPWANCom_8_7),
            Medidores_LPWAN_Industrial:  parseInt(row.MedLPWANInd_8_8),
            Medidores_LPWAN_Oficial:  parseInt(row.MedLPWANOfc_8_9),
            Medidores_LPWAN_Otros_Sectores:  parseInt(row.MedLPWANOtr_8_10),

            Medidores_Otro_Medio_Estrato1:  parseInt(row.MedOtroEst1_9_1),
            Medidores_Otro_Medio_Estrato2:  parseInt(row.MedOtroEst2_9_2),
            Medidores_Otro_Medio_Estrato3:  parseInt(row.MedOtroEst3_9_3),
            Medidores_Otro_Medio_Estrato4:  parseInt(row.MedOtroEst4_9_4),
            Medidores_Otro_Medio_Estrato5:  parseInt(row.MedOtroEst5_9_5),
            Medidores_Otro_Medio_Estrato6:  parseInt(row.MedOtroEst6_9_6),
            Medidores_Otro_Medio_Comercial:  parseInt(row.MedOtroCom_9_7),
            Medidores_Otro_Medio_Industrial:  parseInt(row.MedOtroInd_9_8),
            Medidores_Otro_Medio_Oficial:  parseInt(row.MedOtroOfc_9_9),
            Medidores_Otro_Medio_Otros_Sectores:  parseInt(row.MedOtroOtr_9_10),
            Observacion:  row.Observacion

        }    

        this.excel.push(arrayText);
        });
       // console.info(this.excel);        
      }
    });
  }

  ngOnInit() {
    //this.RowRepotCSV =[ ]; 

  }

 registros: MedidoresView[] = [];

onCreate(event) {
    const modal = this.modalService.open(MedidoresFormComponent,{windowClass:"my-class"});
    modal.result.then((data) => {
      this.loadData(); // on close
    }, (reason) => {
      // on dismiss
      this.handleModalMedidoresFormClose.bind(this),
      this.handleModalMedidoresFormClose.bind(this)
    });
}

onUpload(event) {

  if(this.user_operador===0)
      {   const opt: any = {
            title: 'Gestión reporte AMI',
            text: `No tiene permiso parta realizar esta acción `,
            type: 'warning',
            showCancelButton: false,
            confirmButtonColor: '#6f8ec7',//'#DD6B55',
            confirmButtonText: 'Aceptar!',
            cancelButtonText: "No, cancelar!",
            //buttons: true,
            //dangerMode: true,
          };
          Swal(opt)
          .then((willDelete) => {
            if (willDelete.value) {
            }
          });
      
      }
  else{
        const modal = this.modalService.open(MedidoresUploadComponent,{windowClass:"my-class"});
        modal.result.then((data) => {
          this.loadData(); // on close
        }, (reason) => {
          // on dismiss
          this.handleModalMedidoresFormClose.bind(this),
          this.handleModalMedidoresFormClose.bind(this)
        });
      }


}


handleModalMedidoresFormClose(response) {
  // is response an object?
  if (response === Object(response)) {
    if (response.createMode) {
      response.registro.id = response.id;
      this.registros.unshift(response.registro);
    } else {
      let index = this.registros.findIndex(value => value.Id == response.id);
      this.registros[index] = response.registro;
    }
  }
}

//funcion para exporta en hoja de calculo
 exportAsXLSX():void {
    this.excelService.exportAsExcelFile(this.excel, 'Medidores_Avanzados');
 }

onEdit(event): void {
  
  const modal = this.modalService.open(MedidoresFormComponent,{windowClass:"my-class"});
  modal.result.then((data) => {
    this.loadData(); // on close
  }, (reason) => {
    // on dismiss
    this.handleModalMedidoresFormClose.bind(this),
    this.handleModalMedidoresFormClose.bind(this)
  });
  modal.componentInstance.createMode = false;
  modal.componentInstance.registro_id = event.data.Id;

}

onDelete(event): void {
  //  console.info(event);
    const {Id,  Periodo, Municipio } = event.data;
    const opt: any = {
      title: 'Gestión reporte AMI',
      text: `Seguro que desea borrar el registro del reporte del periodo ${Periodo} del municipio ${Municipio.NombreMunicipio}  ? `,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6f8ec7',//'#DD6B55',
      confirmButtonText: 'Si, borrar!',
      cancelButtonText: "No, cancelar!",
      //buttons: true,
      //dangerMode: true,
    };
    Swal(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          const borra={"Id":Id};
          
          this.registroService.delRegistro('reporteami', borra).subscribe(res => {
              if (res !== null) {
                this.loadData();
                this.showToast('info', 'Gestión reporte AMI', 'Reporte borrado exitosamente');
              }
              else
              {
                this.loadData();
                this.showToast('error', 'Gestión reporte AMI', 'No fue posible borrar el reporte');
              }
            });
        }
      });
  }

  itemselec(event): void {
    // console.log("afssaf");
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
