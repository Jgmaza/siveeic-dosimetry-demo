import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalDataSource } from 'ng2-smart-table';
import { ExcelServicesService } from '../../../@core/data/excel-services.service';
import { EstacionesService } from '../../../@core/data/services/estaciones.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ParamMap, Router, ActivatedRoute } from '@angular/router';
import { OperadorView } from '../../../@core/data/models/operador/operador_view';
import { ConsentimientoService } from '../../../@core/data/services/consentimiento.service';
import { environment } from '../../../../environments/environment';
const filepath = environment.FILES_SERVICE_CARGA;

@Component({
  selector: 'app-operador-list',
  templateUrl: './operador-list.component.html',
  styleUrls: ['./operador-list.component.scss']
})
export class OperadorListComponent implements OnInit {

  uid: number;
  user_operador: number;
  registroForm: FormGroup;
  rowspage:any;
  rowid: any;
  registros: any;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  excel=[];
  source: LocalDataSource = new LocalDataSource();  
  //handleModalOperadorFormClose: any;
  constructor(private modalService: NgbModal,
              private translate: TranslateService,
              private registroService: EstacionesService,
              private consentimientoService: ConsentimientoService,
              private toasterService: ToasterService,
              private excelService:ExcelServicesService,
              private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router
              ) {
    this.load_UserData();
    this.loadData();
    this.construirForm();    
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

load_UserData(): void {
    // rescata el idoperador asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
        //this.uid = user.id;
        this.user_operador = user.operador;
    });
  }

loadData(): void {
    this.registroService.get('estacionoperador/0/'+this.user_operador).subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        //console.info(data)
        this.source.load(data);
        //PARA EXPORTAR EXCEL
        this.excel=[];
        let arrayText:any;
        data.forEach(row => {
        arrayText = {
            Tipo_persona:row.Tipopersona.Nombre,
            Nombre: row.Nombres,
            Tipo_identificacion:row.Tipoidentificacion.NombreIdentificacion,
            Nro_identificacion:row.Nroidentificacion,
            Estaciones_verificadas:  row.Verificado,
            Estaciones_no_verificadas:row.NoVerificado, 
        }    
        this.excel.push(arrayText);
        });
        // console.info(this.excel);
      }
    });
  } 

construirForm() {
    this.registroForm = this.formBuilder.group({
          Rowspage: [null],
    });
  }    
  
paginas(): void {
    this.rowspage=this.registroForm.get('Rowspage').value;
    this.source.setPaging(1,this.rowspage);
  }   

cargarCampos() {

    let addaction=false;
    let editaction=false;
    let delaction=false;
    
    /*
    if(this.user_operador !==0)
      { addaction=false;
        delaction=false;
      }*/

    this.settings = {
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      
      actions: {
      columnTitle: 'Acciones',
      add: addaction,
      delete: delaction,
      edit: editaction,
      custom: [
        {
          name: 'estacionesAction',
          title: '<i class="nb-keypad" title="Gestionar Estaciones de Carga" ></i>',
          position: 'right',
        },/*
        {
          name: 'editAction',
          title: '<i class="nb-edit" title="Editar Estación"></i>',
          position: 'right',
        },
        {
          name: 'deleteAction',
          title: '<i class="nb-trash" title="Borrar Estación" ></i>',
          position: 'right',
        }*/
      ]
    }, 

      mode: 'external',     
      pager: {perPage: 15 },
      columns: {
        // Id: {
        //   title: this.translate.instant('GLOBAL.operador.id'),
        //   // type: 'number;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        Verificado: {
          title: this.translate.instant('GLOBAL.estaciones.verificado'),
          type: 'html',
          valuePrepareFunction: (value) => {
            return `<div align="center">${value}</div>`;
          },
        },
        NoVerificado: {
          title: this.translate.instant('GLOBAL.estaciones.noverificado'),
          type: 'html',
          valuePrepareFunction: (value) => {
            return `<div align="center">${value}</div>`;
          },
        },Nombres: {
          title: this.translate.instant('GLOBAL.estaciones.nombres'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Tipopersona: {
          title: this.translate.instant('GLOBAL.estaciones.tipopersona'),
          // type: 'tipo_usuario;',
          valuePrepareFunction: (value) => {
            return value.Nombre ? value.Nombre : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Nombre + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Tipoidentificacion: {
          title: this.translate.instant('GLOBAL.estaciones.tipoidentificacion'),
          // type: 'tipo_identificacion;',
          valuePrepareFunction: (value) => {
            return value.NombreIdentificacion ? value.NombreIdentificacion : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreIdentificacion + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Nroidentificacion: {
          title: this.translate.instant('GLOBAL.estaciones.nroidentificacion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Departamento: {
          title: this.translate.instant('GLOBAL.estaciones.departamento'),
          // type: 'tipo_estaciones;',
          valuePrepareFunction: (value) => {
            return value.NombreDepartamento ? value.NombreDepartamento : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreDepartamento + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },

        Municipio: {
          title: this.translate.instant('GLOBAL.estaciones.municipio'),
          // type: 'tipo_estaciones;',
          valuePrepareFunction: (value) => {
            return value.NombreMunicipio ? value.NombreMunicipio : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreMunicipio + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Correo: {
          title: this.translate.instant('GLOBAL.estaciones.correo'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Files: {
          title:this.translate.instant('GLOBAL.estaciones.lagalfile'),
          type: 'html',
          valuePrepareFunction: (value) => {
            let files='';
            files = value.File_legal ? '<div><a href="'+filepath+value.File_legal.folder+'/'+value.File_legal.rename+'"  target="popup" onClick="window.open(this.href, this.target, "width=300,height=400"); return false;" ><img width="30" height="32" src="assets/images/pdf.png" alt="'+value.File_legal.rename+'" /></a> </div>' : '';
            return files;
          },
          //width: '5%',
        }, 
      },
    };
  }

onCustomAction(event): void {
    //alert(`Custom event '${event.action}' fired on row №: ${event.data.Id}`);
    switch(event.action) { 
          case 'estacionesAction': { 
            this.onEstaciones(event)
            break; 
          } 
          default: { 
            //statements; 
            break; 
          } 
      } 
  }  

onEstaciones(event): void {
    this.rowid = event.data.Id;
    this.router.navigate(['pages/cargave/list-estaciones'], { queryParams: { OP3R : this.rowid } });
  }

  //funcion para exporta en hoja de calculo
exportAsXLSX():void {
    this.excelService.exportAsExcelFile(this.excel, 'EstacionesCargaXEmpresa');
  }  

ngOnInit() {
  }

onCreate(event) {
   
}

itemselec(event): void {
    // console.log("afssaf");
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
