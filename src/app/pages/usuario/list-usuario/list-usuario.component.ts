import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ExcelServicesService } from '../../../@core/data/excel-services.service';
import { UsuariosService } from '../../../@core/data/usuarios.service';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import * as moment from 'moment';

@Component({
  selector: 'ngx-list-usuario',
  templateUrl: './list-usuario.component.html',
  styleUrls: ['./list-usuario.component.scss'],
})
export class ListUsuarioComponent implements OnInit {
  uid: number;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  excel=[];
  source: LocalDataSource = new LocalDataSource();

  constructor(private translate: TranslateService, private usuariosService: UsuariosService, private toasterService: ToasterService,
              private excelService:ExcelServicesService ) {
    this.loadData();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  cargarCampos() {
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
        deleteButtonContent: '<i class="nb-locked"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      actions: {add: true, edit:true, delete: false },
      mode: 'external',
      columns: {
        // Id: {
        //   title: this.translate.instant('GLOBAL.usuarios.id'),
        //   // type: 'number;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        Nombres: {
          title: this.translate.instant('GLOBAL.usuarios.nombres'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Apellidos: {
          title: this.translate.instant('GLOBAL.usuarios.apellidos'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Tipoidentificacion: {
          title: this.translate.instant('GLOBAL.usuarios.tipoidentificacion'),
          // type: 'tipo_identificacion;',
          valuePrepareFunction: (value) => {
            return value.NombreIdentificacion ? value.NombreIdentificacion : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreIdentificacion + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Nroidentificacion: {
          title: this.translate.instant('GLOBAL.usuarios.nroidentificacion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },        
        Usuario: {
          title: this.translate.instant('GLOBAL.usuarios.usuario'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Correo: {
          title: this.translate.instant('GLOBAL.usuarios.correo'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Indicativo: {
          title: this.translate.instant('GLOBAL.usuarios.indicativo'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Telefonofijo: {
          title: this.translate.instant('GLOBAL.usuarios.telefonofijo'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Celular: {
          title: this.translate.instant('GLOBAL.usuarios.celular'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Tipousuario: {
          title: this.translate.instant('GLOBAL.usuarios.tipousuario'),
          // type: 'tipo_usuario;',
          valuePrepareFunction: (value) => {
            return value.NombreTipo ? value.NombreTipo : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreTipo + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Coordinacionoperativa: {
          title: this.translate.instant('GLOBAL.usuarios.coordinacionoperativa'),
          // type: 'number;',
          valuePrepareFunction: (value) => {
            return value.Coordinacionoperativa;
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.Coordinacionoperativa + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        // Clave: {
        //   title: this.translate.instant('GLOBAL.usuarios.clave'),
        //   // type: 'string;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        Estadousuario: {
          title: this.translate.instant('GLOBAL.usuarios.estadousuario'),
          // type: 'tipo_estado;',
          valuePrepareFunction: (value) => {
            return value.NombreEstado ? value.NombreEstado : '';
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            return (((cell.NombreEstado + '').toLowerCase()).indexOf(search.toLowerCase()) !== -1 || search === '')
          },
        },
        Fechacreacion: {
          title: this.translate.instant('GLOBAL.usuarios.fechacreacion'),
          // type: 'Date;',
          valuePrepareFunction: (value) => {
            return moment(value).format('YYYY/MM/DD HH:mm:SS');
          },
        },
        Fechaexpira: {
          title: this.translate.instant('GLOBAL.usuarios.fechaexpira'),
          // type: 'Date;',
          valuePrepareFunction: (value) => {
            return moment(value).format('YYYY/MM/DD HH:mm:SS');
          },
        },
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.usuariosService.get('usuario/?limit=0').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        //console.info(data)
        this.source.load(data);
        //PARA EXPORTAR EXCEL
        this.excel=[];
        let arrayText:any;
        data.forEach(row => {
        arrayText = {
            Nombres: row.Nombres,
            Apellidos:row.Apellidos,
            Tipoidentificacion:row.Tipoidentificacion.NombreIdentificacion,
            Nroidentificacion:row.Nroidentificacion,
            Usuario:  row.Usuario,
            Tipousuario:  row.Tipousuario.NombreTipo,
            Empresa_servicio:  row.Coordinacionoperativa.Coordinacionoperativa,
            Correo:  row.Correo,
            Indicativo:  row.Indicativo,
            Telefonofijo:row.Telefonofijo, 
            Celular:  row.Celular,
            
        }    
        this.excel.push(arrayText);
        });
        // console.info(this.excel);   
      }
    });
  }

  //funcion para exporta en hoja de calculo
  exportAsXLSX():void {
    this.excelService.exportAsExcelFile(this.excel, 'Usuarios');
  }

  ngOnInit() {
  }

  onEdit(event): void {
    this.uid = event.data.Id;
    this.activetab();
  }

  onCreate(event): void {
    this.uid = 0;
    this.activetab();
  }

  onDelete(event): void {
  //  console.info(event);
    const {Id,  Nombres, Apellidos, Nroidentificacion } = event.data;
    const opt: any = {
      title: 'Restaurar Contraseña?',
      text: `Se restaurará la contraseña de ${Nombres} ${Apellidos} a su estado predeterminado`,
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.usuariosService.restaurarPassword(Id, { Nroidentificacion : Nroidentificacion}).subscribe(res => {
            if (res !== null) {
              this.loadData();
              this.showToast('info', 'Contraseña Restaurada', 'Se ha restaurado la contraseña de forma exitosa');
            }
          });
        }
      });
  }

  activetab(): void {
    this.cambiotab = !this.cambiotab;
  }

  selectTab(event): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.usuarios.lista')) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }

  onChange(event) {
    if (event) {
      this.loadData();
      this.cambiotab = !this.cambiotab;
    }
  }


  itemselec(event): void {
    // console.log("afssaf");
  }

  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
      positionClass: 'toast-top-center',
      timeout: 5000,  // ms
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
