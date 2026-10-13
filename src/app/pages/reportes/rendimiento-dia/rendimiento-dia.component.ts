import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../@core/data/dashboard.service';

import { LocalDataSource } from 'ng2-smart-table';
import { ExcelServicesService } from '../../../@core/data/excel-services.service';


@Component({
  selector: 'ngx-rendimiento-dia',
  templateUrl: './rendimiento-dia.component.html',
  styleUrls: ['./rendimiento-dia.component.scss'],
})

export class RendimientoDiaComponent implements OnInit {

  descripcion = ['Avance'];
  campos = ['Departamento', 'Municipio', 'Clase', 'Centropoblado', 'Cordinacionoperativa', 'Areaoperativa', 'Unidadcobertura'];

  settings: any;
  source: LocalDataSource = new LocalDataSource();

  reporteResultados: any[] = [];
  excel=[];
  constructor(private dashboardService: DashboardService , private excelService:ExcelServicesService) {
    this.cargarCampos();
  }

  filtro(event) {
    // console.info(event);
    const { d, m, c, cp, co, ao, uc} = event;
    const path = {path: `${d}/${m}/${c}/${cp}/${co}/${ao}/${uc}`}
    this.dashboardService.aplyFilter({...event, ...path});
    this.loadData(path);
    this.cargarCampos();
  }

  //funcion para exporta en hoja de calculo
  exportAsXLSX():void {
         this.excelService.exportAsExcelFile(this.excel, 'cobertura_enumerador_x_dia');
      }

  //funcion para consumir los datos y cargarlos a la tabla
      loadData(path): void {
        this.dashboardService.get('reportecoberturadia', path.path).subscribe(res => {
          if (res !== null) {
            this.reporteResultados= <Array<any>>res;
            this.source.load(this.reporteResultados); //carga los datos al soure de ng2-smart-table
            //PARA EXPORTAR EXCEL
            this.excel=[];
            this.reporteResultados.forEach(row => {
              this.excel.push(row);
            });
          }
        });
      }


// se definen las columnas de la tabla
    cargarCampos() {
      this.settings = {
        mode: 'external',
        actions: false,
        noDataMessage: 'Buscando Datos ...',
        /*
        actions: {
          add: false,
          edit: false,
          delete: false,
        },*/
        pager:{display:true,
               perPage:10,
              },
        columns: {
          Fecha: {
            title: "Fecha",
            //filter:false,
            class:"text-center",
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
          },
          Departamento: {
            title: "Departamento",
            //filter:false,
            class:"text-center",
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
          },
          Municipio: {
            title: "Municipio",
            //filter:false,
            class:"text-center",
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
          },
          Clase: {
            title: "Clase",
            //filter:false,
            class:"text-center",
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
          },
          Centro_poblado: {
            title: "Centro poblado",
            //filter:false,
            class:"text-center",
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
          },
          Sector_urbano: {
            title: "Sector urbano",
            //filter:false,
            class:"text-center",
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
          },
          Seccion_urbana: {
            title: "Sección urbana",
            //filter:false,
            class:"text-center",
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
          },
          Manzana: {
            title: "Manzana",
            //filter:false,
            class:"text-center",
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
          },
          Id_manzana: {
            title: "Id_manzana",
            //filter:false,
            class:"text-center",
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
          },
          Cod_ag: {
            title: "Cod_ag",
            //filter:false,
            class:"text-center",
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
          },
          Supervisor: {
            title: "Supervisor",
            //filter:false,
            class:"text-center",
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
          },
          Enumerador: {
            title: "Enumerador",
            //filter:false,
            class:"text-center",
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
          },

          Cantidad_unidades_registradas: {
            title: "Cantidad unidades registradas",
            filter:false,
            class:"text-center",
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
          },
          Cantidad_unidades_esperadas: {
            title: "Cantidad unidades esperadas",
            filter:false,
            class:"text-center",
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
          },
          Cobertura: {
            title: "Cobertura",
            filter:false,
            class:"text-center",
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
          },
          Porcentaje_cobertura: {
            title: "Porcentaje cobertura",
            filter:false,
            class:"text-center",
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
          },
          Alerta: {
            title: "Alerta",
            filter:false,
            class:"text-center",
            // type: 'string;',
            valuePrepareFunction: (value) => {
              return value;
            },
          },

        },
      };
    }



  ngOnInit() {}
}
