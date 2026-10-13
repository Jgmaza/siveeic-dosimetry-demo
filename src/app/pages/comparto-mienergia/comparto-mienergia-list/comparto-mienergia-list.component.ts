import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalDataSource } from 'ng2-smart-table';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as moment from 'moment';

import { CompartomienergiaService } from '../../../@core/data/services/comparto-mienergia.service';
import { ExcelServicesService } from '../../../@core/data/excel-services.service';
import { CompartomienergiaView } from '../../../@core/data/models/comparto-mienergia/comparto-mienergia_view';
import { CompartomienergiaFormComponent } from '../comparto-mienergia-form/comparto-mienergia-form.component';
import { CompartomienergiaUploadComponent } from '../comparto-mienergia-upload/comparto-mienergia-upload.component';
import { AngularCsv } from 'angular7-csv/dist/Angular-csv'
//import { Servicio } from '../../../@core/data/models/comparto-mienergia/servicioPublico';

@Component({
  selector: 'app-comparto-mienergia-list',
  templateUrl: './comparto-mienergia-list.component.html',
  styleUrls: ['./comparto-mienergia-list.component.scss']
})
export class CompartomienergiaListComponent implements OnInit {
  user_operador: number;
  uid: number;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  excel=[];
  source: LocalDataSource = new LocalDataSource();  


  constructor(private modalService: NgbModal, private translate: TranslateService, private registroService: CompartomienergiaService,
      private toasterService: ToasterService, private excelService:ExcelServicesService) {
    this.load_UserData();
    this.loadData();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }
    
  download(){
    var files = 'assets/formatos/Formato_Reporte_Compartomienergia.xlsx';
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
          title: this.translate.instant('GLOBAL.compartomienergia.operador'),
          // type: 'string;',
        /*valuePrepareFunction: (value) => {
            return value.Nombreoperador? value.Nombreoperador : '';
          },
        */
          type:'html',
          width:'15%',
          valuePrepareFunction: function(value){
            return '<div align="left" > ' + (value.Nombreoperador? value.Nombreoperador : '')+ ' </div>' 
          },  
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Nombreoperador + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Servicio: {
          title: this.translate.instant('GLOBAL.compartomienergia.servicio'),
          type: 'string;',
          valuePrepareFunction: (value) => {
            return value.Nombreservicio? value.Nombreservicio : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Nombreservicio + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Periodo: {
          title: this.translate.instant('GLOBAL.compartomienergia.periodo'),
          type:'html',
          valuePrepareFunction: function(value){
            return '<div align="center"  > ' + value + ' </div>' 
          },  
        },
        Total_recaudo: {
          title: this.translate.instant('GLOBAL.compartomienergia.aportes'),
          type:'html',
          width:'10%',
          valuePrepareFunction: function(value){
            return '<div align="right" > ' + Number(value).toFixed(2).toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",") +' </div>' 
          },
        },
        Fuente_aportes: {
          title: this.translate.instant('GLOBAL.compartomienergia.fuente'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Ciclo_facturacion: {
          title: this.translate.instant('GLOBAL.compartomienergia.facturacion'),
          type:'html',
          width:'5%',
          valuePrepareFunction: function(value){
            return '<div align="center" > ' + value +' </div>' 
          },
        },
        Cantidad_beneficiarios_estrato1: {
          title: this.translate.instant('GLOBAL.compartomienergia.beneficiarios_estrato1'),
          // type: 'string;',
          type:'html',
          width:'5%',
          valuePrepareFunction: function(value){
            return '<div align="center" > ' + value +' </div>' 
          },
        },
        Cantidad_beneficiarios_estrato2: {
          title: this.translate.instant('GLOBAL.compartomienergia.beneficiarios_estrato2'),
          // type: 'string;',
          type:'html',
          width:'5%',
          valuePrepareFunction: function(value){
            return '<div align="center" > ' + value +' </div>' 
          },
        },
        Observacion: {
          title: this.translate.instant('GLOBAL.compartomienergia.observacion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Estadoreporte: {
          title: this.translate.instant('GLOBAL.compartomienergia.estadoreporte'),
          // type: 'tipo_estado;',
          valuePrepareFunction: (value) => {
            return value.NombreEstado ? value.NombreEstado : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreEstado + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Fechacreacion: {
          title: this.translate.instant('GLOBAL.compartomienergia.fechacreacion'),
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

  loadData(): void {

    this.registroService.get('reportecompartoenrg/0/'+this.user_operador+'/?limit=0').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        //console.log(data);
        let datos= []
        for(var i = 0; i < data.length;i++){
           // this.excel
            data[i].Total_recaudo=data[i].Reportecomparto.Total_recaudo;
            data[i].Fuente_aportes=data[i].Reportecomparto.Fuente_aportes;
            data[i].Cod_ciclo=data[i].Reportecomparto.Cod_ciclo;
            data[i].Ciclo_facturacion=data[i].Reportecomparto.Ciclo_facturacion;
            data[i].Cantidad_beneficiarios_estrato1=data[i].Reportecomparto.Cantidad_beneficiarios_estrato1;
            data[i].Cantidad_beneficiarios_estrato2=data[i].Reportecomparto.Cantidad_beneficiarios_estrato2;
            data[i].Observacion=data[i].Reportecomparto.Observacion;    
            }
        // console.info(data);
         this.source.load(data);
        //PARA EXPORTAR EXCEL
        this.excel=[];
        let arrayText:any;
        data.forEach(row => {
        arrayText = {
            Operador_Enegia: row.Operador.Nombreoperador,
            Servicio_publico: row.Servicio.Nombreservicio,
            Periodo_Reporte: row.Periodo,
            Total_recaudo: row.Total_recaudo,
            Fuente_aportes: row.Fuente_aportes,
            Ciclo_facturacion: row.Ciclo_facturacion,
            Cantidad_beneficiarios_estrato1: row.Cantidad_beneficiarios_estrato1,
            Cantidad_beneficiarios_estrato2: row.Cantidad_beneficiarios_estrato2,
            Observacion: row.Observacion,    
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

 registros: CompartomienergiaView[] = [];
 

onCreate(event) {
    const modal = this.modalService.open(CompartomienergiaFormComponent,{windowClass:"my-class"});
    modal.result.then((data) => {
      this.loadData(); // on close
    }, (reason) => {
      // on dismiss
      this.handleModalCompartomienergiaFormClose.bind(this),
      this.handleModalCompartomienergiaFormClose.bind(this)
    });
}

onUpload(event) {

  if(this.user_operador===0)
      {   const opt: any = {
            title: 'Gestión reporte comparto mi energía',
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
        const modal = this.modalService.open(CompartomienergiaUploadComponent,{windowClass:"my-class"});
        modal.result.then((data) => {
          this.loadData(); // on close
        }, (reason) => {
          // on dismiss
          this.handleModalCompartomienergiaFormClose.bind(this),
          this.handleModalCompartomienergiaFormClose.bind(this)
        });
      }
}

handleModalCompartomienergiaFormClose(response) {
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
    this.excelService.exportAsExcelFile(this.excel, 'Compartomienergia_Avanzados');
 }

onEdit(event): void {
  
  const modal = this.modalService.open(CompartomienergiaFormComponent,{windowClass:"my-class"});
  modal.result.then((data) => {
    this.loadData(); // on close
  }, (reason) => {
    // on dismiss
    this.handleModalCompartomienergiaFormClose.bind(this),
    this.handleModalCompartomienergiaFormClose.bind(this)
  });
  modal.componentInstance.createMode = false;
  modal.componentInstance.registro_id = event.data.Id;
}

onDelete(event): void {
  //  console.info(event);
    const {Id,  Periodo, Servicio } = event.data;
    const opt: any = {
      title: 'Gestión reporte comparto mi energía',
      text: `Seguro que desea borrar el registro del reporte del periodo ${Periodo} para el servicio ${Servicio.Nombreservicio}  ? `,
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
          this.registroService.delRegistro('reportecompartoenrg', borra).subscribe(res => {
              if (res !== null) {
                this.loadData();
                this.showToast('info', 'Gestión reporte comparto mi energía', 'Reporte borrado exitosamente');
              }
              else
              {
                this.loadData();
                this.showToast('error', 'Gestión reporte comparto mi energía', 'No fue posible borrar el reporte');
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
