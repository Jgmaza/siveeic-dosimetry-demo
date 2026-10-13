import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../@core/data/dashboard.service';

import { LocalDataSource } from 'ng2-smart-table';
import { ExcelServicesService } from '../../../@core/data/excel-services.service';


@Component({
  selector: 'ngx-rendimiento-consolidado',
  templateUrl: './rendimiento-consolidado.component.html',
  styleUrls: ['./rendimiento-consolidado.component.scss'],
})

export class RendimientoConsolidadoComponent implements OnInit {

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
         this.excelService.exportAsExcelFile(this.excel, 'rendimiento_consolidado_encuestador');
      }

  //funcion para consumir los datos y cargarlos a la tabla
      loadData(path): void {

        this.dashboardService.get('reporterendimientodia', path.path).subscribe(res => {
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
      Enumerador: {
        title: "Enumerador",
        //filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },

      Dia_20191204: {
        title: "Manzanas registradas 2019-11-04",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },
      Dia_20191205: {
        title: "Manzanas registradas 2019-11-05",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },
      Dia_20191206: {
        title: "Manzanas registradas 2019-11-06",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },
      Dia_20191207: {
        title: "Manzanas registradas 2019-11-07",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },
      Dia_20191208: {
        title: "Manzanas registradas 2019-11-08",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },
      Dia_20191209: {
        title: "Manzanas registradas 2019-11-09",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },
      Dia_20191210: {
        title: "Manzanas registradas 2019-11-10",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },
      Dia_20191211: {
        title: "Manzanas registradas 2019-11-11",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },
      Dia_20191212: {
        title: "Manzanas registradas 2019-11-12",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },


      Dia_20191213: {
        title: "Manzanas registradas 2019-11-13",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },
      Dia_20191214: {
        title: "Manzanas registradas 2019-11-14",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },
      Dia_20191215: {
        title: "Manzanas registradas 2019-11-15",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },
      Dia_20191216: {
        title: "Manzanas registradas 2019-11-16",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },
      Dia_20191217: {
        title: "Manzanas registradas 2019-11-17",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },
      Dia_20191218: {
        title: "Manzanas registradas 2019-11-18",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },
      Dia_20191219: {
        title: "Manzanas registradas 2019-11-19",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },
      Dia_20191220: {
        title: "Manzanas registradas 2019-11-20",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },
      Dia_20191221: {
        title: "Manzanas registradas 2019-11-21",
        filter:false,
        class:"text-center",
        // type: 'string;',
        valuePrepareFunction: (value) => {
          return value;
        },
      },
    
      Total: {
        title: "Total manzanas",
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
