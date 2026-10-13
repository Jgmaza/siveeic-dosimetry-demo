
import { TipoUsuario } from './../../../@core/data/models/tipo_usuario';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UsuariosService } from '../../../@core/data/usuarios.service';
import { FORM_TIPO_USUARIO } from './form-tipo_usuario';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-crud-tipo-usuario',
  templateUrl: './crud-tipo_usuario.component.html',
  styleUrls: ['./crud-tipo_usuario.component.scss'],
})
export class CrudTipoUsuarioComponent implements OnInit {
  config: ToasterConfig;
  tipo_usuario_id: number;

  @Input('tipo_usuario_id')
  set name(tipo_usuario_id: number) {
    this.tipo_usuario_id = tipo_usuario_id;
    this.loadTipoUsuario();
  }

  @Output() eventChange = new EventEmitter();

  info_tipo_usuario: TipoUsuario;
  formTipoUsuario: any;
  regTipoUsuario: any;
  clean: boolean;

  constructor(private translate: TranslateService, private usuariosService: UsuariosService, private toasterService: ToasterService) {
    this.formTipoUsuario = FORM_TIPO_USUARIO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
   }

  construirForm() {
    this.formTipoUsuario.titulo = this.translate.instant('GLOBAL.tipo_usuario');
    this.formTipoUsuario.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formTipoUsuario.campos.length; i++) {
      this.formTipoUsuario.campos[i].label = this.translate.instant('GLOBAL.' + this.formTipoUsuario.campos[i].label_i18n);
      this.formTipoUsuario.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formTipoUsuario.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }


  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formTipoUsuario.campos.length; index++) {
      const element = this.formTipoUsuario.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }


  public loadTipoUsuario(): void {
    if (this.tipo_usuario_id !== undefined && this.tipo_usuario_id !== 0) {
      this.usuariosService.get('tipo_usuario/?query=id:' + this.tipo_usuario_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_tipo_usuario = <TipoUsuario>res[0];
          }
        });
    } else  {
      this.info_tipo_usuario = undefined;
      this.clean = !this.clean;
    }
  }

  updateTipoUsuario(tipoUsuario: any): void {

    const opt: any = {
      title: 'Update?',
      text: 'Update TipoUsuario!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_tipo_usuario = <TipoUsuario>tipoUsuario;
        this.usuariosService.put('tipo_usuario', this.info_tipo_usuario)
          .subscribe(res => {
            this.loadTipoUsuario();
            this.eventChange.emit(true);
            this.showToast('info', 'updated', 'TipoUsuario updated');
          });
      }
    });
  }

  createTipoUsuario(tipoUsuario: any): void {
    const opt: any = {
      title: 'Create?',
      text: 'Create TipoUsuario!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_tipo_usuario = <TipoUsuario>tipoUsuario;
        this.usuariosService.post('tipo_usuario', this.info_tipo_usuario)
          .subscribe(res => {
            this.info_tipo_usuario = <TipoUsuario>res;
            this.eventChange.emit(true);
            this.showToast('info', 'created', 'TipoUsuario created');
          });
      }
    });
  }

  ngOnInit() {
    this.loadTipoUsuario();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_tipo_usuario === undefined) {
        this.createTipoUsuario(event.data.TipoUsuario);
      } else {
        this.updateTipoUsuario(event.data.TipoUsuario);
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
