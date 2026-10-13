import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../@core/data/dashboard.service';

@Component({
  selector: 'ngx-cobertura-global',
  templateUrl: './cobertura-global.component.html',
  styleUrls: ['./cobertura-global.component.scss'],
})
export class CoberturaGlobalComponent implements OnInit {
/*
  pieces = [
    {
      gte: 105,
      label: '105% - mas',
      color: '#253678', // morado
    },
    {
      lt: 105,
      gt: 95,
      label: '95% - 104%' ,
      color: '#3399cc',
    },
    {
      lt: 95,
      gt: 75,
      label: '75% - 94%' ,
      color: '#cc9933', // yellow
    },
    {
      lt: 75,
      gt: 0,
      label: '0.1% - 74%' ,
      color: '#b3144e',
    },
  ];*/

  pieces = [
    {
      gte: 0.1,
      label: '0.1% - mas',
      color: '#669966', // morado
    },
    {
      lt: 0.1,
      gt: -1,
      label: '0%' ,
      color: '#3399cc',
    },
  ];


  campos = ['Departamento', 'Municipio', 'Clase', 'Centropoblado', 'Cordinacionoperativa', 'Areaoperativa', 'Unidadcobertura'];
  constructor(private dashboardService: DashboardService) {}

  filtro(event) {
    // console.info(event);
    const { d, m, c, cp, co, ao, uc } = event;
    const path = {path: `${d}/${m}/${c}/${cp}/${co}/${ao}/${uc}`}
    this.dashboardService.aplyFilter({...event, ...path});
  }

  ngOnInit() {}
}
