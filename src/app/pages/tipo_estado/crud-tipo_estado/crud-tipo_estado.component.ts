
import { TipoEstado } from './../../../@core/data/models/tipo_estado';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UsuariosService } from '../../../@core/data/usuarios.service';
import { FORM_TIPO_ESTADO } from './form-tipo_estado';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-crud-tipo-estado',
  templateUrl: './crud-tipo_estado.component.html',
  styleUrls: ['./crud-tipo_estado.component.scss'],
})
export class CrudTipoEstadoComponent implements OnInit {
  config: ToasterConfig;
  tipo_estado_id: number;

  @Input('tipo_estado_id')
  set name(tipo_estado_id: number) {
    this.tipo_estado_id = tipo_estado_id;
    this.loadTipoEstado();
  }

  @Output() eventChange = new EventEmitter();

  info_tipo_estado: TipoEstado;
  formTipoEstado: any;
  regTipoEstado: any;
  clean: boolean;

  constructor(private translate: TranslateService, private usuariosService: UsuariosService, private toasterService: ToasterService) {
    this.formTipoEstado = FORM_TIPO_ESTADO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
   }

  construirForm() {
    this.formTipoEstado.titulo = this.translate.instant('GLOBAL.tipo_estado');
    this.formTipoEstado.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formTipoEstado.campos.length; i++) {
      this.formTipoEstado.campos[i].label = this.translate.instant('GLOBAL.' + this.formTipoEstado.campos[i].label_i18n);
      this.formTipoEstado.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formTipoEstado.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }


  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formTipoEstado.campos.length; index++) {
      const element = this.formTipoEstado.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }


  public loadTipoEstado(): void {
    if (this.tipo_estado_id !== undefined && this.tipo_estado_id !== 0) {
      this.usuariosService.get('tipo_estado/?query=id:' + this.tipo_estado_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_tipo_estado = <TipoEstado>res[0];
          }
        });
    } else  {
      this.info_tipo_estado = undefined;
      this.clean = !this.clean;
    }
  }

  updateTipoEstado(tipoEstado: any): void {

    const opt: any = {
      title: 'Update?',
      text: 'Update TipoEstado!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_tipo_estado = <TipoEstado>tipoEstado;
        this.usuariosService.put('tipo_estado', this.info_tipo_estado)
          .subscribe(res => {
            this.loadTipoEstado();
            this.eventChange.emit(true);
            this.showToast('info', 'updated', 'TipoEstado updated');
          });
      }
    });
  }

  createTipoEstado(tipoEstado: any): void {
    const opt: any = {
      title: 'Create?',
      text: 'Create TipoEstado!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_tipo_estado = <TipoEstado>tipoEstado;
        this.usuariosService.post('tipo_estado', this.info_tipo_estado)
          .subscribe(res => {
            this.info_tipo_estado = <TipoEstado>res;
            this.eventChange.emit(true);
            this.showToast('info', 'created', 'TipoEstado created');
          });
      }
    });
  }

  ngOnInit() {
    this.loadTipoEstado();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_tipo_estado === undefined) {
        this.createTipoEstado(event.data.TipoEstado);
      } else {
        this.updateTipoEstado(event.data.TipoEstado);
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
