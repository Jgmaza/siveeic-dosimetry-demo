
import { TipoIdentificacion } from './../../../@core/data/models/tipo_identificacion';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UsuariosService } from '../../../@core/data/usuarios.service';
import { FORM_TIPO_IDENTIFICACION } from './form-tipo_identificacion';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-crud-tipo-identificacion',
  templateUrl: './crud-tipo_identificacion.component.html',
  styleUrls: ['./crud-tipo_identificacion.component.scss'],
})
export class CrudTipoIdentificacionComponent implements OnInit {
  config: ToasterConfig;
  tipo_identificacion_id: number;

  @Input('tipo_identificacion_id')
  set name(tipo_identificacion_id: number) {
    this.tipo_identificacion_id = tipo_identificacion_id;
    this.loadTipoIdentificacion();
  }

  @Output() eventChange = new EventEmitter();

  info_tipo_identificacion: TipoIdentificacion;
  formTipoIdentificacion: any;
  regTipoIdentificacion: any;
  clean: boolean;

  constructor(private translate: TranslateService, private usuariosService: UsuariosService, private toasterService: ToasterService) {
    this.formTipoIdentificacion = FORM_TIPO_IDENTIFICACION;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
   }

  construirForm() {
    this.formTipoIdentificacion.titulo = this.translate.instant('GLOBAL.tipo_identificacion');
    this.formTipoIdentificacion.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formTipoIdentificacion.campos.length; i++) {
      this.formTipoIdentificacion.campos[i].label = this.translate.instant('GLOBAL.' + this.formTipoIdentificacion.campos[i].label_i18n);
      this.formTipoIdentificacion.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formTipoIdentificacion.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }


  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formTipoIdentificacion.campos.length; index++) {
      const element = this.formTipoIdentificacion.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }


  public loadTipoIdentificacion(): void {
    if (this.tipo_identificacion_id !== undefined && this.tipo_identificacion_id !== 0) {
      this.usuariosService.get('tipo_identificacion/?query=id:' + this.tipo_identificacion_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_tipo_identificacion = <TipoIdentificacion>res[0];
          }
        });
    } else  {
      this.info_tipo_identificacion = undefined;
      this.clean = !this.clean;
    }
  }

  updateTipoIdentificacion(tipoIdentificacion: any): void {

    const opt: any = {
      title: 'Update?',
      text: 'Update TipoIdentificacion!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_tipo_identificacion = <TipoIdentificacion>tipoIdentificacion;
        this.usuariosService.put('tipo_identificacion', this.info_tipo_identificacion)
          .subscribe(res => {
            this.loadTipoIdentificacion();
            this.eventChange.emit(true);
            this.showToast('info', 'updated', 'TipoIdentificacion updated');
          });
      }
    });
  }

  createTipoIdentificacion(tipoIdentificacion: any): void {
    const opt: any = {
      title: 'Create?',
      text: 'Create TipoIdentificacion!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_tipo_identificacion = <TipoIdentificacion>tipoIdentificacion;
        this.usuariosService.post('tipo_identificacion', this.info_tipo_identificacion)
          .subscribe(res => {
            this.info_tipo_identificacion = <TipoIdentificacion>res;
            this.eventChange.emit(true);
            this.showToast('info', 'created', 'TipoIdentificacion created');
          });
      }
    });
  }

  ngOnInit() {
    this.loadTipoIdentificacion();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_tipo_identificacion === undefined) {
        this.createTipoIdentificacion(event.data.TipoIdentificacion);
      } else {
        this.updateTipoIdentificacion(event.data.TipoIdentificacion);
      }
    }
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
