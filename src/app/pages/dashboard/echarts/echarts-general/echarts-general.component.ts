import { Component, OnDestroy, Input, OnChanges, AfterViewInit } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { DashboardService } from '../../../../@core/data/dashboard.service';

@Component({
  selector: 'ngx-echarts-general',
  template: `
    <div echarts [options]="options" [hidden]="ocultar" (chartInit)="onChartInit($event)" class="echarts"></div>
    <div [hidden]="!ocultar">
    </div>
  `,
  styleUrls: ['./echart-general.component.scss'],

})
export class EchartsGeneralComponent implements OnDestroy, OnChanges, AfterViewInit {

  options: any = {};
  themeSubscription: any;
  summary: any;
  grouped: any = {};
  echartsIntance: any;
  colors: any;
  echartsConfig: any;
  @Input('process') process: any;
  @Input('serviceGraph') serviceGraph: any;
  @Input('descripcion') descripcion: any;
  @Input('demarcacion') demarcacion: any;
  @Input('labeldemarcacion') labeldemarcacion: any;
  @Input('min_max') min_max: any;
  clase: string;
  info = '';
  ocultar = false;
  subscriptionFilter: any;

  constructor(private theme: NbThemeService, private dashboardService: DashboardService) {
    this.themeSubscription = this.theme.getJsTheme().subscribe(async (config) => {
      this.colors = config.variables;
      this.echartsConfig = config.variables.echarts;
      await this.delay(1000);
      this.setChartData();
    });
  }

  ngOnChanges(changes) {
    if (changes.process !== undefined) {
      if (changes.process.currentValue !== undefined) {
        this.process = changes.process.currentValue;
        this.setChartData();
      }
    }
  }

  async setChartData() {
    this.subscriptionFilter = this.dashboardService.eventFilter$.subscribe((filtro: any) => {
      if (typeof filtro !== 'undefined') {
        const { path } = filtro;
        this.dashboardService.get(this.serviceGraph, `${path}`)
          .subscribe(async (linesData: any) => {
            if (linesData.lenght === 0) {
              this.ocultar = true;
            }else {
              this.ocultar = false;
            }
            // console.info(`totalencuestas/${filtro.m}/${filtro.co}/${filtro.ao}/${filtro.uc}`);
            // console.info(linesData);
            if (linesData.lenght === 0) {
              this.info = 'No hay datos para mostrar'
            }else {
              this.info = ''
            }
            // console.info(linesData);
            // const data = linesData.map((result: any) => ({value: result.Encuesta, name: result.Estado});
            this.summary = linesData;
            // this.grouped.data = await this.groupBy(this.summary, 'Estado');
            // this.grouped.keys = await Object.keys(this.grouped.data).map(key => key.replace(/\n/g, ''));
            // this.grouped.values = linesData.map((result: any) => ({ value: result.Encuestas, name: result.Estado }));
            // debugger;
            this.echartsIntance.setOption(
              {
                ...this.setOptions(linesData),
              ...{
                textStyle: {
                  fontFamily: 'Roboto',
                },
              },
            });
             // console.info('keys', this.grouped.keys);
             // console.info('values', this.grouped.values);
             // console.info('data', this.grouped.data);
          });
      }
    });

  }
  onChartInit(ec) {
    this.echartsIntance = ec;
  }

  setOptions(data: any) {
    // console.info(data);
    if (typeof data.length === 'undefined') {
      data = [data];
    }

    if (this.serviceGraph === 'totalviviendasabsoluto'  ||
        this.serviceGraph === 'totalmanzanasabsoluto' 
        ) {
          data = data[0];
          return {
            tooltip : {
                show: false,
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow',        // 默认为直线，可选为：'line' | 'shadow'
                },
            },
            //legend: {
            //  data: [`Cantidad Avance`, 'Cantidad Restante'],
            //},
            grid: {
                containLabel: true,
                height: 50,
            },
            xAxis:  {
                type: 'value',
                max: [data.Cantavance+data.Cantrestante],
            },
            yAxis: {
                type: 'category',
              //  data: ['Total'],
            },
            series: [
                {
                    name: 'Cantidad Avance',
                    type: 'bar',
                    stack: '总量',
                    color: `${data.Coloravance}`,
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                            formatter: '{c} ',
                        },
                    },
                    data: [data.Cantavance],
                },
                {
                    name: 'Cantidad Restante',
                    type: 'bar',
                    stack: '总量',
                    color: `${data.Colorrestante}`,
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                            formatter: '{c}',
                        },
                    },
                    data: [data.Cantrestante],
                },
            ],
          };
        }

    if (this.serviceGraph === 'totalmanzanas' ||
        this.serviceGraph === 'totalviviendas' ||
        this.serviceGraph === 'totalviviendasmixto'   ) {
      data = data[0];
      return {
        tooltip : {
            show: false,
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'shadow',        // 默认为直线，可选为：'line' | 'shadow'
            },
        },
      //  legend: {
      //    data: [`% Avance`, '% Restante'],
      //},
        grid: {
            containLabel: true,
            height: 50,
        },
        xAxis:  {
            type: 'value',
            max: [data.Porcavance+data.Porcrestante],
        },
        yAxis: {
            type: 'category',
          //  data: ['Total'],
        },
        series: [
            {
                name: '% Avance',
                type: 'bar',
                stack: '总量',
                color: `${data.Coloravance}`,
                label: {
                    normal: {
                        show: true,
                        position: 'top',
                        formatter: '{c} %',
                    },
                },
                data: [data.Porcavance],
            },
            {
                name: '% Restante',
                type: 'bar',
                stack: '总量',
                color: `${data.Colorrestante}`,
                label: {
                    normal: {
                        show: true,
                        position: 'top',
                        formatter: '{c}%',
                    },
                },
                data: [data.Porcrestante],
            },
        ],
      };
    }


    if (this.serviceGraph === 'totalviviendasdia'  ) {
        // console.info(this.min_max);
      return {
          dataZoom: [
            {
              id: 'dataZoomY',
              type: 'slider',
              yAxisIndex: [0],
              filterMode: 'empty',
              startValue: this.min_max.min_zoom,
              endValue: this.min_max.max_zoom,
            },
          ],
          tooltip: {
              trigger: 'axis',
              formatter: function (params) {
                  params = params[0];
                  return `${params.name}<br>${params.value} %`
              },
              axisPointer: {
                  animation: false,
              },
          },
          xAxis: {
              type: 'category',
              data: data.map((row: any) => (row.Nombre)),
              name:'Día',
              nameTextStyle:{fontWeight:'bold'},
          },
          yAxis: {
              type: 'value',
              min: this.min_max.min,
              max: this.min_max.max,
              name:'Porcentaje',
              nameTextStyle:{fontWeight:'bold'},
          },
          series: [{
              data: data.map((row: any) => (row.Porcavance)),
              type: 'line',
              label: {show: true,
                      position: 'top',
                      distance: 5,
                      formatter: '{c} %',
                     },
              markLine: {
                  precision: 4,
                  silent: true,
                  data: this.demarcacion,
                  label: {show: true,
                          formatter: '{c} %',
                         },
                },
          }],
      }
    }


    if (this.serviceGraph === 'unidadesvisitadasabsoluto' ||
        this.serviceGraph === 'manzanasvisitadasabsoluto' ||
        this.serviceGraph === 'emplazamientoabsoluto' ||
        this.serviceGraph === 'sectoresabsoluto25' ||
        this.serviceGraph === 'sectoresabsoluto54' ) {

  // console.info(this.summary);
    
  //  console.info(this.demarcacion);
  // this.clase = 'totalviviendasvisitadas';
  this.clase = this.serviceGraph;
  const grupo = this.groupBy(this.summary, 'Grupo');
  const dataNombre = this.groupBy(this.summary, 'Nombre');
  this.grouped.keys = Object.keys(grupo).map(key => key.replace(/\n/g, ''));
  //  console.info(this.grouped.keys);
  //  console.info(dataNombre);
  const namesSubGroup = Object.keys(dataNombre).map(key => key.replace(/\n/g, ''))
  //  console.info(namesSubGroup);
  const series = namesSubGroup.map((group: string) => {
    return {
      name: group,
      type: 'bar',
      label: {
        normal: {
            show: true,
            position: 'right',
            formatter: '{c}',
        },
    },color: (dataNombre[group]).map((serie: any) => (serie.Coloravance)),
      data: (dataNombre[group]).map((serie: any) => (serie.Cantavance)),
      ancho: (dataNombre[group]).map((serie: any) => (serie.Cantavance)),
      
    }})
    //  console.info(series);
    var comparar = [];
    //busca por cada serie el porcentaje mas alto
     comparar.push(Math.max.apply(null, series[0].ancho));
     comparar.push(Math.max.apply(null, series[1].ancho));
     const ancho = Math.round(Math.max.apply(null, comparar)*1.05);
     //const ancho = 150;
    //  console.info(ancho);

  return {
      tooltip: {
          trigger: 'axis',
          axisPointer: {
              type: 'shadow',
          }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis : [
          {
              type : 'value',
              max: ancho,
          },
      ],
      legend: {
          data: namesSubGroup,
      },
      yAxis: {
          type: 'category',
          data: this.grouped.keys,
      },
      series: series,
  }
}    





    if (this.serviceGraph === 'estadosunidad' ||
        this.serviceGraph === 'totalviviendasvisitadasefectivo' ) {

      // console.info(this.summary);
      // asigna valor esperado a linea mark line
        if (this.serviceGraph === 'unidadesvisitadas1' ||
            this.serviceGraph === 'totalviviendasvisitadasefectivo' ) {
              this.demarcacion[0].xAxis=this.summary[0].Porcesperado;
            }
      //  console.info(this.demarcacion);
      // this.clase = 'totalviviendasvisitadas';
      this.clase = this.serviceGraph;
      const grupo = this.groupBy(this.summary, 'Grupo');
      const dataNombre = this.groupBy(this.summary, 'Nombre');
      this.grouped.keys = Object.keys(grupo).map(key => key.replace(/\n/g, ''));
      //  console.info(this.grouped.keys);
      //  console.info(dataNombre);
      const namesSubGroup = Object.keys(dataNombre).map(key => key.replace(/\n/g, ''))
      //  console.info(namesSubGroup);
      const series = namesSubGroup.map((group: string) => {
        return {
          name: group,
          type: 'bar',
          label: {
            normal: {
                show: true,
                position: 'right',
                formatter: '{c} %',
            },
        },color: (dataNombre[group]).map((serie: any) => (serie.Coloravance)),
          data: (dataNombre[group]).map((serie: any) => (serie.Porcavance)),
          ancho: (dataNombre[group]).map((serie: any) => (serie.Porcavance+serie.Porcrestante)),
          markLine: {
              precision: 4,
              silent: true,
              data: this.demarcacion,
              label: this.labeldemarcacion,
            },
        }})
        //  console.info(series);
        var comparar = [];
        //busca por cada serie el porcentaje mas alto
         comparar.push(Math.max.apply(null, series[0].ancho));
         comparar.push(Math.max.apply(null, series[1].ancho));
         const ancho = Math.max.apply(null, comparar)+5;
         //const ancho = 150;
        //  console.info(ancho);

      return {
          tooltip: {
              trigger: 'axis',
              axisPointer: {
                  type: 'shadow',
              }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          },
          xAxis : [
              {
                  type : 'value',
                  max: ancho,
              },
          ],
          legend: {
              data: namesSubGroup,
          },
          yAxis: {
              type: 'category',
              data: this.grouped.keys,
          },
          series: series,
      }
    }


    if (this.serviceGraph === 'unidadesvisitadas' ||
        this.serviceGraph === 'manzanasvisitadas' ||
        this.serviceGraph === 'totalcoordinacionvisitadas' ||
        this.serviceGraph === 'totalcoordinacionefectivo' ||
        this.serviceGraph === 'totalcoordinacionhogar' ||
        this.serviceGraph === 'totalcoordinacionpersona' ||
        this.serviceGraph === 'sectoresunidad25' ||
        this.serviceGraph === 'sectoresunidad54'||
        this.serviceGraph === 'rendimiento25' ||
        this.serviceGraph === 'rendimiento54') {

      // asigna valor esperado a linea mark line
      if (this.serviceGraph === 'unidadesvisitadas' ||
          this.serviceGraph === 'manzanasvisitadas' ||
          this.serviceGraph === 'totalcoordinacionvisitadas' ||
          this.serviceGraph === 'totalcoordinacionefectivo' ||
          this.serviceGraph === 'totalcoordinacionhogar' ||
          this.serviceGraph === 'totalcoordinacionpersona'  ||
          this.serviceGraph === 'sectoresunidad25' ||
          this.serviceGraph === 'sectoresunidad54') {
        this.demarcacion[0].xAxis=this.summary[0].Porcesperado;
      }

      if (this.serviceGraph === 'rendimiento25' ||
          this.serviceGraph === 'rendimiento54') {
        this.demarcacion[0].xAxis=this.summary[0].Porcesperado;
       // this.demarcacion[1].xAxis=this.summary[0].Porcesperadocl1;
       // this.demarcacion[2].xAxis=this.summary[0].Porcesperadocl2;
      }
     // console.info(this.summary.length);
      var pos = (this.summary.length-1);
      var ancho =  (this.summary[pos].Porcavance+this.summary[pos].Porcrestante+15);

      return {
          color: ['#3398DB'],
          tooltip : {
              trigger: 'axis',
              axisPointer : {
                  type : 'shadow',
              },
              formatter: '{b} <br> {c} %',
          },
          grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true,
          },
          xAxis : [
              {
                  type : 'value',
                  max: ancho,
              },
          ],
          yAxis : [
              {
                  type : 'category',
                  data: data.map((row: any) => (row.Nombre)),
                  axisTick: {
                      alignWithLabel: true,
                  },
              },
          ],
          series : [
              {
                color: data.map((row: any) => (row.Coloravance)),
                type: 'bar',
                barWidth: '60%',
                data: data.map((row: any) => (row.Porcavance)),
                label: {
                        normal: {
                            show: true,
                            position: 'right',
                            formatter: '{c} %',
                        },
                    },
                markLine: {
                    precision: 4,
                    silent: true,
                    data: this.demarcacion,
                    label: this.labeldemarcacion,
                  },
              },
          ],
      };
    }



    /**VERIFICAR SI SE BORRAN**/

    if (
      this.serviceGraph === 'diligenciamiento' ||
      this.serviceGraph === 'completitud') {
    data = data[0];
    return {
      tooltip : {
          show: false,
          trigger: 'axis',
          axisPointer : {            // 坐标轴指示器，坐标轴触发有效
              type : 'shadow',        // 默认为直线，可选为：'line' | 'shadow'
          },
      },
    //  legend: {
    //    data: [`% Avance`, '% Restante'],
    //},
      grid: {
          containLabel: true,
          height: 50,
      },
      xAxis:  {
          type: 'value',
          max: 100,
      },
      yAxis: {
          type: 'category',
        //  data: ['Total'],
      },
      series: [
          {
              name: '% Avance',
              type: 'bar',
              stack: '总量',
              color: `${data.Coloravance}`,
              label: {
                  normal: {
                      show: true,
                      position: 'top',
                      formatter: '{c} %',
                  },
              },
              data: [data.Porcavance],
          },
      ],
    };
  }

  if (this.serviceGraph === 'personasetnia') {
    return {
        color: ['#3398DB'],
        tooltip : {
            trigger: 'axis',
            axisPointer : {
                type : 'shadow',
            },
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
        xAxis : [
            {
                type : 'value',
                max: 100,
            },
        ],
        yAxis : [
            {
                type : 'category',
                data: data.map((row: any) => (row.Nombre)),
                axisTick: {
                    alignWithLabel: true,
                },
            },
        ],
        series : [
            {
              color: data.map((row: any) => (row.Coloravance0)),
              type: 'bar',
              barWidth: '60%',
              data: data.map((row: any) => (row.Porcavance)),
              label: {
                      normal: {
                          show: true,
                          position: 'right',
                          formatter: '{c} %',
                      },
                  },
            },
        ],
    };
  }

  if (this.serviceGraph === 'personasetniatorta' ) {
    return {
      tooltip: {
          trigger: 'item',
          formatter: 'Personas pertenecientas a {b} : <b> {c}</b><br> Porcentaje:<b>{d}%</b> ',
      },
      legend: {
          orient: 'vertical',
          x: 'left',
          data: data.map((row: any) => (row.Nombre)),
      },
      series: [
          {
              type: 'pie',
              radius: ['50%', '70%'],
              avoidLabelOverlap: false,
              label: {
                  normal: {
                      show: true,
                      formatter: '{c}',
                  },
              },
              labelLine: {
                  normal: {
                      show: false,
                  },
              },
              color: data.map((row: any) => (row.Coloravance)),
              data: data.map((row: any) => ({value: row.Cantavance, name: row.Nombre})),
          },
      ],
  }

  }

    if (this.serviceGraph === 'ocupacionviviendas' ) {
      return {
        tooltip: {
            trigger: 'item',
            formatter: 'Viviendas {b} : <b> {c}</b><br> Porcentaje:<b>{d}%</b> ',
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data: data.map((row: any) => (row.Nombre)),
        },
        series: [
            {
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: true,
                        formatter: '{c}',
                    },
                },
                labelLine: {
                    normal: {
                        show: false,
                    },
                },
                color: data.map((row: any) => (row.Coloravance)),
                data: data.map((row: any) => ({value: row.Cantavance, name: row.Nombre})),
            },
        ],
    }

    }


if (this.serviceGraph === 'rendimiento' ) {
      this.clase = 'rendimiento';
      const fechas = this.groupBy(this.summary, 'Fecha');
      const dataNombre = this.groupBy(this.summary, 'Nombre');
      this.grouped.keys = Object.keys(fechas).map(key => key.replace(/\n/g, ''));
     //  console.info(this.grouped.keys);
     //  console.info(dataNombre);
      const namesSubGroup = Object.keys(dataNombre).map(key => key.replace(/\n/g, ''))
    //  console.info(namesSubGroup);
      const series = namesSubGroup.map((group: string) => {
        return {
          name: group,
          type: 'bar',
          label: {
            normal: {
                show: true,
                position: 'right',
                formatter: '{c} %',
            },
        },color: (dataNombre[group]).map((serie: any) => (serie.Coloravance)),
          data: (dataNombre[group]).map((serie: any) => (serie.Porcavance)),
          ancho: (dataNombre[group]).map((serie: any) => (serie.Porcavance+serie.Porcrestante)),
        }})
        //  console.info(series);
        var comparar = [];
        //busca por cada serie el porcentaje mas alto
         comparar.push(Math.max.apply(null, series[0].ancho));
         comparar.push(Math.max.apply(null, series[1].ancho));
         const ancho = Math.max.apply(null, comparar)+5;
        //  console.info(ancho);

      return {
        dataZoom: [
          {
              id: 'dataZoomX',
              type: 'slider',
              xAxisIndex: [0],
              filterMode: 'filter',   // Set as 'filter' so that the modification
                                      // of window of xAxis willl effect the
                                      // window of yAxis.
              start: 0,
              end: 100,//this.maximo,//100,
          },
          {
              id: 'dataZoomY',
              type: 'slider',
              yAxisIndex: [0],
              filterMode: 'empty',
              start: 0,
              end: 100,
          },
        ],
          tooltip: {
              trigger: 'axis',
              axisPointer: {
                  type: 'shadow',
              },
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          },
          xAxis : [
              {
                  type : 'value',
                  max: ancho,
              },
          ],
          legend: {
              data: namesSubGroup,
          },
          yAxis: {
              type: 'category',
              data: this.grouped.keys,
          },
          series: series,
      }
    }


    if (this.serviceGraph === 'totalresultado' ) {
          this.clase = 'totalresultado';
          //console.info(this.summary);
          // const tipo = this.groupBy(this.summary, 'Tipo');
          const dataNombre = this.groupBy(this.summary, 'Nombre');
          //  this.grouped.keys = Object.keys(tipo).map(key => key.replace(/\n/g, ''));
          // console.info(this.grouped.keys);
          // console.info(dataNombre);
          const namesSubGroup = Object.keys(dataNombre).map(key => key.replace(/\n/g, ''))
          // console.info(namesSubGroup);
          const series = namesSubGroup.map((group: string) => {
            return {
              name: group,
              type: 'bar',
              barWidth: '70%',
              label: {
                normal: {
                    show: true,
                    position: 'top',
                    formatter: '{c} ',
                },
            },color: (dataNombre[group]).map((serie: any) => (serie.Coloravance)),
              data: (dataNombre[group]).map((serie: any) => (serie.Cantavance)),
              ancho: (dataNombre[group]).map((serie: any) => (serie.Totalregistros)),
              stack: '总量',
            }})
            const ancho = series[0].ancho;
          return {

              tooltip: {
                  trigger: 'axis',
                  axisPointer: {
                      type: 'shadow',
                  },
              },
              grid: {
                  containLabel: true,
                  height: 50,
              },
              xAxis : [
                  {
                      type : 'value',
                      max: ancho,
                  },
              ],
              legend: {
                  data: namesSubGroup,
              },
              yAxis: {
                  type: 'category',
                  data: this.grouped.keys,
              },

              series: series,
          }
        }


  }

  groupBy = function (array: Array<any>, prop: any) {
    return array.reduce(function (groups, item) {
      const val = item[prop];
      groups[val] = groups[val] || [];
      groups[val].push(item);
      return groups;
    }, {});
  };

  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async ngAfterViewInit() {
    if (typeof this.process !== 'undefined') {
      this.setChartData();
    }
  }

  ngOnDestroy(): void {
      if ( typeof this.themeSubscription !== 'undefined') {
        this.themeSubscription.unsubscribe();
      }
      if ( typeof this.subscriptionFilter !== 'undefined') {
        this.subscriptionFilter.unsubscribe();
      }
  }
}
