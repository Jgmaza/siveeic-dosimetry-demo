import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ParamMap, Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { EstacionesView } from '../../../@core/data/models/estaciones/estaciones_view';
import { EstacionesService } from '../../../@core/data/services/estaciones.service';
import { formatNumber } from '@angular/common';

const filepath = environment.FILES_SERVICE_CARGA;
@Component({
  selector: 'ngx-estaciones-list',
  templateUrl: './estaciones-list.component.html',
  styleUrls: ['./estaciones-list.component.scss'],
})
export class EstacionesListComponent {
  //config: NbToastrConfig;
  config: ToasterConfig;
  
  index = 1;
  rowid: any;
  registroForm: FormGroup;
  identidad: any;
  operador: any;
  cambiotab: boolean = false;
  duplicatab: boolean = false;
  user_operador: number;
  estadoop: number;
  settings: any;
  source: LocalDataSource = new LocalDataSource();
  registros: EstacionesView[] = [];
  Estado: any[];
  constructor(private translate: TranslateService,
              private registroService: EstacionesService,
              private formBuilder: FormBuilder,
              private toasterService: ToasterService,
              private route: ActivatedRoute,
              private router: Router) {

    this.load_UserData();
    this.loadParam();
    this.loadData();
    this.loadDataOper();
    this.loadOptionsEstado();
    this.construirForm();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });

  }

  loadData(): void {
    this.registroService.get('estacioncarga/0/'+this.identidad).subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        this.source.load(data);
      }
    });
  }

  loadDataOper(): void {
    this.registroService.get('operador/'+this.identidad).subscribe(res => {
      if (res !== null) {
          const datos = <any>res;
          this.operador = { name: datos[0].Nombres.toUpperCase() };
      }
    });
  } 

  load_UserData(): void {
    // rescata el idoperador asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
        //this.uid = user.id;
        this.user_operador = user.operador;
        this.estadoop=user.estadoop;
    });
  }  

  loadOptionsEstado(): void {
    this.registroService.get('tipo_estado')
      .subscribe(res => {
        if (res !== null) {
          this.Estado = <Array<any>>res;
          //se selleciona la opcion por defecto
        }
      });
  }

  construirForm() {
    this.registroForm = this.formBuilder.group({
          Rowspage: [null],
    });
  }

  loadParam(): void {
    let param=JSON.stringify(this.route.snapshot.queryParamMap);
    let aux = JSON.parse(param);  
    //this.registro_padre_padre_id=aux.params.P4R4M2;
    this.identidad=aux.params.OP3R;
  }

  // "nb-plus-circled", "nb-power", "nb-square","nb-list","nb-edit,"nb-trash" https://eeskildsen.github.io/nebular-icons-reference/
  cargarCampos() {
    let addaction=false;
    let editaction=false;
    let delaction=false;
    /*
    if(this.estadoop !==1)
      { addaction=false;
        editaction=false;
        delaction=false;
      }*/
      
    this.settings = {
      add: {
        addButtonContent: '<i class="nb-plus" title="Agregar Estación"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit" title="Editar Estación"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash" title="Borrar Estación" ></i>',
        confirmDelete: true,
      },

      actions: {
        columnTitle: 'Acciones',
        add: addaction,
        delete: delaction,
        edit: editaction,
        custom: [
          {
            name: 'puntosAction',
            title: '<i class="nb-keypad" title="Gestionar Cargadores" ></i>',
            position: 'right',
          },
          {
            name: 'validateAction',
            title: '<i class="nb-shuffle" title="Validar Estación" ></i>',
            position: 'right',
          }
        ]
      },                

      mode: 'external',
      pager: {perPage: 15 },
      columns: {
         //File: {
        //   title: this.translate.instant('GLOBAL.estaciones.id'),
        //   // type: 'number;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        File_foto: {
          title: this.translate.instant('GLOBAL.estaciones.foto'),
          type: 'html',
          valuePrepareFunction: (value) => {
            return value!='' ? '<div><img width="80" height="80" src="'+filepath+value.folder+'/'+value.rename+'" alt="imageAlt" /></div>' : '';
          },
          //width: '5%',
        },  
        Nombre: {
          title: this.translate.instant('GLOBAL.estaciones.nombre'),
          type: 'html',
          valuePrepareFunction: (value) => {
            return '<div align="left"> ' + value + ' </div>';
          },
          //width: '15%',          
        },
        Departamento: {
          title: this.translate.instant('GLOBAL.estaciones.departamento'),
          // type: 'tipo_identificacion;',
          valuePrepareFunction: (value) => {
            return value.NombreDepartamento ? value.NombreDepartamento : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreDepartamento + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
          //width: '5%',
        },        
        Municipio: {
          title: this.translate.instant('GLOBAL.estaciones.municipio'),
          // type: 'tipo_identificacion;',
          valuePrepareFunction: (value) => {
            return value.NombreMunicipio ? value.NombreMunicipio : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreMunicipio + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
          //width: '5%',
        },
        Direccion: {
          title: this.translate.instant('GLOBAL.estaciones.direccion'),
          type: 'html',
          valuePrepareFunction: (value) => {
            return '<div align="left"> ' + value + ' </div>';
          },
          //width: '10%',
        },
        Ubicacion: {
          title: this.translate.instant('GLOBAL.estaciones.ubicacion'),
          // type: 'tipo_identificacion;',
          valuePrepareFunction: (value) => {
            return value.Nombre ? value.Nombre : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Nombre + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
          //width: '5%',
        },
        Parqueadero: {
          title: this.translate.instant('GLOBAL.estaciones.parqueadero'),
          type: 'html',
          valuePrepareFunction: (value) => {
            let data = value.Parqueo ? value.Parqueo : '';
            return data;
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Parqueo + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
          //width: '5%',
        },     
        Tipoestacion: {
          title: this.translate.instant('GLOBAL.estaciones.puntoscarga'),
          type: 'html',
          valuePrepareFunction: (value) => {
            let data = value.Puntoscarga ? value.Puntoscarga : '';
            return data;
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Puntoscarga + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
          //width: '10%',
        },
        Acceso: {
            title: this.translate.instant('GLOBAL.estaciones.acceso'),
            type: 'html',
            valuePrepareFunction: (value) => {
              return '<div align="left"> ' + value + ' </div>';
            },
          //width: '10%',
        },               
        Horario: {
          title: this.translate.instant('GLOBAL.estaciones.horario'),
          type: 'html',
          valuePrepareFunction: (value) => {
            let data = value.Diainicia ? value.Diainicia+' - '+value.Diacierre : '';
            data += value.Horainicia!='' ? ', '+value.Horainicia+' - '+value.Horacierre : '';
            data += value.Diainicia2 ? ';<br> '+value.Diainicia2+' - '+value.Diacierre2 : '';
            data += value.Horainicia2!='' ? ', '+value.Horainicia2+' - '+value.Horacierre2 : '';
            data += value.Diainicia3 ? ';<br> '+value.Diainicia3+' - '+value.Diacierre3 : '';
            data += value.Horainicia3!='' ? ', '+value.Horainicia3+' - '+value.Horacierre3 : '';
            return data;
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Parqueo + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
          //width: '10%',
        },
        File_cumplimiento: {
          title: this.translate.instant('GLOBAL.estaciones.cumplimiento'),
          type: 'html',
          valuePrepareFunction: (value) => {
            let files='';
            files = value!='' ? '<div><a href="'+filepath+value.folder+'/'+value.rename+'"  target="popup" onClick="window.open(this.href, this.target, "width=300,height=400"); return false;" ><img width="30" height="32" src="assets/images/pdf.png" alt="'+value.rename+'" /><p style="font-size:2px;">'+value.name+'</p> </a> </div>' : '';
            return files;
          },
          //width: '5%',
        },
        File_conformidad: {
          title: this.translate.instant('GLOBAL.estaciones.conformidad'),
          type: 'html',
          valuePrepareFunction: (value) => {
            let files='';
            files = value!='' ? '<div><a href="'+filepath+value.folder+'/'+value.rename+'"  target="popup" onClick="window.open(this.href, this.target, "width=300,height=400"); return false;" ><img width="30" height="32" src="assets/images/pdf.png" alt="'+value.rename+'" /><p style="font-size:2px;">'+value.name+'</p> </a> </div>' : '';
            return files;
          },
          //width: '5%',
        }, 
        Estado: {
          title: this.translate.instant('GLOBAL.estaciones.estado'),
          // type: 'tipo_estado;',
          valuePrepareFunction: (value) => {
            return value.NombreEstado ? value.NombreEstado : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreEstado + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
          width: '4%',
        },     
        Fechacreacion: {
          title: this.translate.instant('GLOBAL.estaciones.fecharegistro'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
          width: '5%',
        },
      },
    };

  }

  itemselec(event): void {
    
  }  

  deactivetab(): void {
    this.cambiotab = false;
    this.duplicatab = false;
  }
  activetab(): void {
    this.cambiotab = !this.cambiotab;
  }
  
  onChange(event) {
    if (event) {
      this.loadData();
      this.cambiotab = !this.cambiotab;
    }
  } 
  
  onReturn(): void {
  this.router.navigate(['pages/cargave/list-operadores'], {/* queryParams: { OP3R : this.registro_oper }*/ });
  }
  
  onCustomAction(event): void {
    //alert(`Custom event '${event.action}' fired on row №: ${event.data.Id}`);
    switch(event.action) { 
          case 'validateAction': { 
              this.onValidate(event)
              break; 
            } 
          case 'puntosAction': { 
            this.onPuntos(event)
            break; 
          } 
          default: { 
            //statements; 
            break; 
          } 
      } 
  }  

  onPuntos(event): void {
    this.rowid = event.data.Id;
    this.router.navigate(['pages/cargave/list-puntos'], { queryParams: { EST4 : this.rowid, OP3R:this.identidad } });
  }

  download(){
    var files = 'assets/formatos/Formato_carga_estaciones.xlsx';
    window.location.href=files
  }  

  onValidate(event): void {
          const {Id, Nombre, Estado, Files } = event.data;
          let est = this.Estado.filter(row=> row.NombreEstado === 'Activo')[0] ;
          let msj = '';
          let msjbtn = '';
          let msjtoast = '';
          let estado = '';
          if(Estado.Id !== est.Id ){
            msj = 'La verificación de datos, habilita la visualización pública de la estación. '; 
            msj += `Seguro que desea habilitar el registro de la estación : "${Nombre}" ?`, 
            msjbtn = ' habilitar';
            msjtoast =  'Registro de la estación habilitado exitosamente';
            estado = est
          }
          else {
            msj = 'La estación se encuentra verificada, si anula la verificación, inhabilita la visualización pública de la estación. '; 
            msj +=  `Seguro que desea deshabilitar el registro de la estación : "${Nombre}" ?`, 
            msjbtn = ' deshabilitar';
            msjtoast =  'Registro de la estación deshabilitado exitosamente';
            estado = this.Estado.filter(row=> row.NombreEstado === 'Inactivo')[0] ;
          }

          let dato = {"Id":Id, "Estado":estado}
          const opt: any = {
            title: 'Validar Estación',
            text: `${msj}`,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#6f8ec7',//'#DD6B55',
            confirmButtonText: 'Si, '+msjbtn,
            cancelButtonText: "No, cancelar!",
            //buttons: true,
            //dangerMode: true,
            //showCancelButton: true,
          };
          Swal(opt)
            .then((willDelete) => {
              if (willDelete.value) {
                    
                this.registroService.putRegistro('validaestacion', dato).subscribe(res => {
                    if (res !== null) {
                      this.loadData();
                      this.showToast('success', 'Validar Estaciones', `${msjtoast}`);
                    }
                    else
                    {
                      this.loadData();
                      this.showToast('warning', 'Validar Estaciones', `No fue posible ${msjbtn} el registro de la estación`);
                    }
                  });
                }
            });
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
