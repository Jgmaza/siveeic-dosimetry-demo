import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalDataSource } from 'ng2-smart-table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as moment from 'moment';

import { UsuariosruralService } from '../../../@core/data/services/usuarios-rural.service';
import { ExcelServicesService } from '../../../@core/data/excel-services.service';
import { UsuariosruralView } from '../../../@core/data/models/usuarios-rural/usuarios-rural_view';
import { UsuariosruralFormComponent } from '../usuarios-rural-form/usuarios-rural-form.component';
import { UsuariosruralUploadComponent } from '../usuarios-rural-upload/usuarios-rural-upload.component';
import { AngularCsv } from 'angular7-csv/dist/Angular-csv';

import { Operador } from '../../../@core/data/models/operador/operador';
import { Departamento } from './../../../@core/data/models/departamento';
import { Municipio } from './../../../@core/data/models/municipio';
import { Periodo } from '../../../@core/data/models/general/periodo';
import { Periodoanio } from '../../../@core/data/models/general/periodoanio';
import { Solucion } from './../../../@core/data/models/usuarios-rural/solucion';
import { Fuente } from './../../../@core/data/models/usuarios-rural/fuentefinancia';

@Component({
  selector: 'app-usuarios-rural-list',
  templateUrl: './usuarios-rural-list.component.html',
  styleUrls: ['./usuarios-rural-list.component.scss']
})
export class UsuariosruralListComponent implements OnInit {
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
  Ciclo = [];
  Departamento = [];
  Municipio = [];
  Tipo_Solucion = [];
  Fuente_Financiacion = [];

  constructor(private modalService: NgbModal, private translate: TranslateService, private registroService: UsuariosruralService,
      private toasterService: ToasterService, private excelService:ExcelServicesService, private formBuilder: FormBuilder) {
    this.load_UserData();
    //this.loadData();

    this.construirForm();
    this.loadOptionsOperador();
    this.loadOptionsAnio();
    this.loadOptionsPeriodo();
    this.loadOptionsDepartamento();
    this.loadOptionsSolucion();
    this.loadOptionsFuente();

    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  construirForm() {
    this.filtrarForm = this.formBuilder.group({
      Operador: [null],
      Ciclo: [null],
      Anio: [null],
      Fuente_Financiacion: [null],
      Tipo_Solucion: [null],
      Periodo: [null],
      Departamento: [null],
      Municipio: [{ value: "", disabled: true }],
      Tipo_Municipio: [null],
    });
  }
    
  download(){
    var files = 'assets/formatos/Formato_Reporte_Usuariosrurales.xlsx';
    window.location.href=files
  }

  cargarCampos() {

    //console.info(this.uid+' '+this.user_operador)
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
      //activa inactiva botones
      actions: { add: permiso,edit: false,delete: permiso 
       },
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
          title: this.translate.instant('GLOBAL.usuariosrural.operador'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value.Nombreoperador? value.Nombreoperador : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Nombreoperador + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Periodo: {
          title: this.translate.instant('GLOBAL.usuariosrural.periodo'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Cantidad_Usuarios: {
          title: this.translate.instant('GLOBAL.usuariosrural.usuarios'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Fuente_Financiacion: {
          title: this.translate.instant('GLOBAL.usuariosrural.fuente'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Tipo_Solucion: {
          title: this.translate.instant('GLOBAL.usuariosrural.solucion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Fecha_inicio: {
          title: this.translate.instant('GLOBAL.usuariosrural.fechaini'),
          // type: 'Date;',
          valuePrepareFunction: (value) => {
            return moment(value).format('YYYY/MM/DD');
          },
        },
        Departamento: {
          title: this.translate.instant('GLOBAL.usuariosrural.departamento'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value.NombreDepartamento? value.NombreDepartamento : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Nombredepartamento + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Municipio: {
          title: this.translate.instant('GLOBAL.usuariosrural.municipio'),
          // type: 'tipo_estado;',
          valuePrepareFunction: (value) => {
            return value.NombreMunicipio? value.NombreMunicipio : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Nombremunicipio + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Vereda: {
          title: this.translate.instant('GLOBAL.usuariosrural.vereda'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Latitud: {
          title: this.translate.instant('GLOBAL.usuariosrural.latitud'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Longitud: {
          title: this.translate.instant('GLOBAL.usuariosrural.longitud'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Altitud: {
          title: this.translate.instant('GLOBAL.usuariosrural.altitud'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Estadoreporte: {
          title: this.translate.instant('GLOBAL.usuariosrural.estadoreporte'),
          // type: 'tipo_estado;',
          valuePrepareFunction: (value) => {
            return value.NombreEstado ? value.NombreEstado : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreEstado + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Fechacreacion: {
          title: this.translate.instant('GLOBAL.usuariosrural.fechacreacion'),
          // type: 'Date;',
          valuePrepareFunction: (value) => {
            return moment(value).format('YYYY/MM/DD');
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

  loadOptionsAnio(): void {
    this.registroService.get('periodoaniorural')
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          this.Anio = <Array<Periodoanio>>res;
        }
      });
  }  

  loadOptionsPeriodo(): void {
    let periodo: Array<any> = [];
    this.registroService.get('periodorural')
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
      let limpiar={"Departamento":null,"Municipio":null,"Periodo":null,"Anio":null,"Fuente_Financiacion":null,"Tipo_Solucion":null,"Tipo_Municipio":null,};
      if(this.user_operador==0) {
             limpiar["Operador"]=null;
            }
      this.filtrarForm.patchValue(limpiar);
      this.filtrarForm.get('Municipio').disable();
  }

  loadData(): void {

    let filtros = this.filtrarForm.value;
    let operador=0;
    let periodo=0;
    let depto=0;
    let municipio=0;
    let parametro='?';
    // console.log(filtros)
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
      {parametro+= 'Anio='+filtros.Anio.Id;}
    if(filtros.Fuente_Financiacion!==null){   
        parametro+= '&Fuente_Financiacion='+filtros.Fuente_Financiacion.Id;
      }
    if(filtros.Tipo_Solucion!==null){   
        parametro+= '&Tipo_Solucion='+filtros.Tipo_Solucion.Id;
      }
    if(filtros.Tipo_Municipio!==null){   
        parametro+= '&Tipo_Municipio='+filtros.Tipo_Municipio;
      }  

      // /reporteusrural/:id?/:id_operador?/:periodo?/:id_departamento?/:id_municipio?/:vereda?
      // this.registroService.get('reporteusrural/0/'+this.user_operador+'/?limit=0').subscribe(res => {
      this.registroService.get('reporteusrural/0/'+operador+'/'+periodo+'/'+depto+'/'+municipio+'/'+parametro).subscribe(res => {  
      if (res !== null) {
        const data = <Array<any>>res;
        //console.log(data);
        let datos= []

        for(var i = 0; i < data.length;i++){
           // this.excel
            data[i].Cantidad_Usuarios=data[i].Reporterural.Cantidad_Usuarios;
            data[i].Cod_Fuente_Financiacion=data[i].Reporterural.Cod_Fuente_Financiacion;
            data[i].Fuente_Financiacion=data[i].Reporterural.Fuente_Financiacion;
            data[i].Cod_Tipo_Solucion=data[i].Reporterural.Cod_Tipo_Solucion;
            data[i].Tipo_Solucion=data[i].Reporterural.Tipo_Solucion;
            data[i].Fecha_inicio=data[i].Reporterural.Fecha_inicio;    
            }
             
        // console.info(data);
         this.source.load(data);
        //PARA EXPORTAR EXCEL
        this.excel=[];
        let arrayText:any;
        data.forEach(row => {

        arrayText = {
            Operador_Enegia: row.Operador.Nombreoperador,
            Periodo_Reporte: row.Periodo,
            Cantidad_Usuarios:row.Cantidad_Usuarios,
            Fuente_Financiacion:row.Fuente_Financiacion,
            Tipo_Solucion:row.Tipo_Solucion,
            Fecha_inicio:row.Fecha_inicio,  
            Departamento:  row.Departamento.NombreDepartamento ,
            Municipio:  row.Municipio.NombreMunicipio,
            Vereda:  row.Vereda,
            Latitud:row.Latitud,  
            Longitud:row.Longitud,
            Altitud:row.Altitud,
            Fecha_reporte:  row.Fechacreacion ,
        }    

        this.excel.push(arrayText);
        });
       // console.info(this.excel);        
      }
    });
  }

  ngOnInit() {
    }

 registros: UsuariosruralView[] = [];
 

onCreate(event) {
    const modal = this.modalService.open(UsuariosruralFormComponent,{windowClass:"my-class"});
    modal.result.then((data) => {
      this.loadData(); // on close
    }, (reason) => {
      // on dismiss
      this.handleModalUsuariosruralFormClose.bind(this),
      this.handleModalUsuariosruralFormClose.bind(this)
    });
}

onUpload(event) {

  if(this.user_operador===0)
      {   const opt: any = {
            title: 'Gestión reporte usuarios rurales',
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
        const modal = this.modalService.open(UsuariosruralUploadComponent,{windowClass:"my-class"});
        modal.result.then((data) => {
          this.loadData(); // on close
        }, (reason) => {
          // on dismiss
          this.handleModalUsuariosruralFormClose.bind(this),
          this.handleModalUsuariosruralFormClose.bind(this)
        });
      }
}

handleModalUsuariosruralFormClose(response) {
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
    this.excelService.exportAsExcelFile(this.excel, 'Usuariosrural_Avanzados');
 }

onEdit(event): void {
  
  const modal = this.modalService.open(UsuariosruralFormComponent,{windowClass:"my-class"});
  modal.result.then((data) => {
    this.loadData(); // on close
  }, (reason) => {
    // on dismiss
    this.handleModalUsuariosruralFormClose.bind(this),
    this.handleModalUsuariosruralFormClose.bind(this)
  });
  modal.componentInstance.createMode = false;
  modal.componentInstance.registro_id = event.data.Id;

}

onDelete(event): void {
  //  console.info(event);
    const {Id,  Periodo, Municipio } = event.data;
    const opt: any = {
      title: 'Gestión reporte usuarios rurales',
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
          
          this.registroService.delRegistro('reporteusrural', borra).subscribe(res => {
              if (res !== null) {
                this.loadData();
                this.showToast('info', 'Gestión reporte usuarios rurales', 'Reporte borrado exitosamente');
              }
              else
              {
                this.loadData();
                this.showToast('error', 'Gestión reporte usuarios rurales', 'No fue posible borrar el reporte');
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
