import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../@core/data/dashboard.service';

@Component({
  selector: 'ngx-rendimiento-programado',
  templateUrl: './rendimiento-programado.component.html',
  styleUrls: ['./rendimiento-programado.component.scss'],
})
export class RendimientoProgramadoComponent implements OnInit {

      demarcacion = [{
        name: 'Cúcuta',
        xAxis: 0,
        lineStyle: {
          color: '#253678',
          },
        },
        { name: 'Ubate',
          xAxis: 0,
          lineStyle: {
            color: '#cc9933',
          },
        }/*,
        {   name: 'Clase 2',
            xAxis: 0,
            lineStyle: {
              color: '#669966',
            },
        }*/
        ];


    labeldemarcacion= {show: true,
                    formatter: '{c} %',
                  };


    campos = ['Departamento', 'Municipio', 'Clase', 'Centropoblado', 'Cordinacionoperativa', 'Areaoperativa', 'Unidadcobertura'];
    //campos = ['Departamento', 'Municipio', 'Clase'];
    constructor(private dashboardService: DashboardService) {}

    filtro(event) {
    // console.info(event);
    const { d, m, c, cp, co, ao, uc } = event;
    const path = {path: `${d}/${m}/${c}/${cp}/${co}/${ao}/${uc}`}
    this.dashboardService.aplyFilter({...event, ...path});
    }

  ngOnInit() {
  }

}
