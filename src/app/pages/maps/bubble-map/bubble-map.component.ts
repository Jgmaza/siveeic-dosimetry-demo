import { Component, OnDestroy, Input, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { NbThemeService } from '@nebular/theme';
import { graphic, registerMap } from 'echarts';
import { DashboardService } from '../../../@core/data/dashboard.service';
import { LoaderService } from '../../../@core/utils/load.service';

@Component({
  selector: 'ngx-bubble-map',
  styleUrls: ['./bubble-map.component.scss'],
  template: `
    <nb-card>
      <div echarts [options]="options" class="echarts"></div>
    </nb-card>
  `,
})
export class BubbleMapComponent implements OnDestroy, AfterViewInit {


  latlong: any = {};
  mapData: any[];
  nameMap: any[];
  max = -Infinity;
  min = Infinity;
  options: any;

  bubbleTheme: any;
  geoColors: any[];

  private alive = true;
  mapLoaded = false;
  @Input('urlMap') urlMap: any;
  @Input('serviceMap') serviceMap: any;
  @Input('filtro') filtro: any;
  @Input('idMap') idMap: any;
  @Input('titulo') titulo: any;
  @Input('subTitulo') subTitulo: any;
  @Input('totalValue') totalValue: any;
  @Input('totalLabel') totalLabel: any;
  @Input('cantValue') cantValue: any;
  @Input('cantLabel') cantLabel: any;
  @Input('keyValue') keyValue: any;
  @Input('keyCoord') keyCoord: any;
  @Input('keyName') keyName: any;
  @Input('minValue') minValue: any;
  @Input('maxValue') maxValue: any;
  @Input('pieces') pieces: any;
  subscriptionFilter: any;

  constructor(private theme: NbThemeService,
    private dashboardService: DashboardService,
    private loading: LoaderService) {
  }

  ngAfterViewInit(): void {
    this.subscriptionFilter = this.dashboardService.eventFilter$.subscribe((filtro: any) => {
      const { path } = filtro;
      console.info(path);
      // rescata departamento y municipio para el mapa
      var splitted = path.split("/", 3);
      //  console.info(splitted);
      this.idMap=splitted[0]+splitted[1];
      //  console.info(this.idMap);


      combineLatest([
        this.dashboardService.maps$,
        this.dashboardService.get(this.serviceMap, path),
        this.theme.getJsTheme(),
      ])
        .pipe(
          takeWhile(() => this.alive))
        .subscribe(([map, service, config]: [any, any, any]) => {

          this.mapLoaded = true;
          if ( typeof map[this.idMap] !== 'undefined') {
            registerMap(this.idMap, map[this.idMap]);
          }

          this.bubbleTheme = config.variables.bubbleMap;

/*
          this.mapData = service.map((data: any) => ({ coordina:data[this.keyCoord], totalCant: this.totalLabel, total: data[this.totalValue], labelCant: this.cantLabel, cant: data[this.cantValue], value: parseFloat(data[this.keyValue]).toFixed(2),  name: data[this.keyName], color: '#e9e8eb' }));
          this.nameMap = service.map((data: any) => ({ [data[this.keyName]]: data[this.keyName] }));


          this.options = {
            title: {
              text: this.titulo,
              subtext: this.subTitulo,
            },
            tooltip: {
              trigger: 'item',
              formatter: params => {
                if (typeof params.data === 'undefined') {
                  return `No hay datos para mostrar`;
                } else {
                //  console.info(params.data);
                  return `Coordinación operativa : <b>${params.data.coordina}</b><br>${params.data.totalCant} : <b>${params.data.total}</b><br>${params.data.labelCant} : <b>${params.data.cant}</b><br>Porcentaje avance : <b>${params.value} %</b><br>${params.name}`;
                }
              },
            },
            visualMap: {
              left: 'right',
              calculable: false,
              pieces: this.pieces,
            },
            series: [
              {
                roam: true,
                type: 'map',
                selectedMode: 'single',
                map: this.idMap,
                itemStyle: {
                  emphasis: { label: { show: true } },
                },
                data: this.mapData,
                nameMap: this.nameMap,
              },
            ],
          };

*/


        if(this.serviceMap==='mapacoordinacionop')
            {

              this.mapData = service.map((data: any) => ({ coordina:data[this.keyCoord], labelCant: this.cantLabel, cant: data[this.cantValue], value: parseFloat(data[this.keyValue]).toFixed(2),  name: data[this.keyName], color: '#e9e8eb' }));
              this.nameMap = service.map((data: any) => ({ [data[this.keyName]]: data[this.keyName] }));

              this.options = {
                title: {
                  text: this.titulo,
                  subtext: this.subTitulo,
                },
                tooltip: {
                  trigger: 'item',
                  formatter: params => {
                    if (typeof params.data === 'undefined') {
                      return `No hay datos para mostrar`;
                    } else {
                    //  console.info(params.data);
                      return `${params.data.labelCant} : <b>${params.data.cant}</b><br>Coordinación operativa : <b>${params.data.coordina}</b><br>UC :${params.name}`;
                    }
                  },
                },
                visualMap: {
                  left: 'right',
                  calculable: false,
                  pieces: this.pieces,
                },
                series: [
                  {
                    roam: true,
                    type: 'map',
                    selectedMode: 'single',
                    map: this.idMap,
                    itemStyle: {
                      emphasis: { label: { show: true } },
                    },
                    data: this.mapData,
                    nameMap: this.nameMap,
                  },
                ],
              };

            }

        else
            {
                this.mapData = service.map((data: any) => ({ coordina:data[this.keyCoord], totalCant: this.totalLabel, total: data[this.totalValue], labelCant: this.cantLabel, cant: data[this.cantValue], value: parseFloat(data[this.keyValue]).toFixed(2),  name: data[this.keyName], color: '#e9e8eb' }));
                this.nameMap = service.map((data: any) => ({ [data[this.keyName]]: data[this.keyName] }));

                this.options = {
                  title: {
                    text: this.titulo,
                    subtext: this.subTitulo,
                  },
                  tooltip: {
                    trigger: 'item',
                    formatter: params => {
                      if (typeof params.data === 'undefined') {
                        return `No hay datos para mostrar`;
                      } else {
                        //  console.info(params.data);
                        // return `Coordinación operativa : <b>${params.data.coordina}</b><br>${params.data.totalCant} : <b>${params.data.total}</b><br>${params.data.labelCant} : <b>${params.data.cant}</b><br>Porcentaje avance : <b>${params.value} %</b><br>${params.name}`;
                        return `${params.data.totalCant} : <b>${params.data.total}</b><br>${params.data.labelCant} : <b>${params.data.cant}</b><br>Porcentaje avance : <b>${params.value} %</b><br>${params.name}`;
                      }
                    },
                  },
                  visualMap: {
                    left: 'right',
                    calculable: false,
                    pieces: this.pieces,
                  },
                  series: [
                    {
                      roam: true,
                      type: 'map',
                      selectedMode: 'single',
                      map: this.idMap,
                      itemStyle: {
                        emphasis: { label: { show: true } },
                      },
                      data: this.mapData,
                      nameMap: this.nameMap,
                    },
                  ],
                };

            }




          this.loading.hide();
        });
    });
  }

  ngOnDestroy() {
    this.alive = false;
    if ( typeof this.subscriptionFilter !== 'undefined') {
      this.subscriptionFilter.unsubscribe();
    }
  }
}
