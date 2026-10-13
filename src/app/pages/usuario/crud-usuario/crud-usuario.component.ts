import { TipoIdentificacion } from './../../../@core/data/models/tipo_identificacion';
import { TipoUsuario } from './../../../@core/data/models/tipo_usuario';
import { TipoEstado } from './../../../@core/data/models/tipo_estado';
//import { Supervisor } from './../../../@core/data/models/supervisor';
import { Coordinacion } from './../../../@core/data/models/coordinacion';

import { Usuario } from './../../../@core/data/models/usuario';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UsuariosService } from '../../../@core/data/usuarios.service';
import { FORM_USUARIO } from './form-usuario';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

@Component({
  selector: 'ngx-crud-usuario',
  templateUrl: './crud-usuario.component.html',
  styleUrls: ['./crud-usuario.component.scss'],
})
export class CrudUsuarioComponent implements OnInit {
  config: ToasterConfig;
  usuario_id: number;
  tipoUsuario: any = {Id: 0};

  @Input('usuario_id')
  set name(usuario_id: number) {
    this.usuario_id = usuario_id;
    this.loadUsuario();
  }

  @Output() eventChange = new EventEmitter();
 
  info_usuario: Usuario;
  formUsuario: any;
  regUsuario: any;
  clean: boolean;

  constructor(private translate: TranslateService, private usuariosService: UsuariosService, private toasterService: ToasterService) {
    this.formUsuario = FORM_USUARIO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadOptionsTipoidentificacion();
    this.loadOptionsTipousuario();
    this.loadOptionsEstadousuario();
    this.loadOptionsCoordinacionoerativa();
   // this.loadOptionsUsuariosupervisa();
  }

  construirForm() {
    this.formUsuario.titulo = this.translate.instant('GLOBAL.usuarios.usuario');
    this.formUsuario.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formUsuario.campos.length; i++) {
      this.formUsuario.campos[i].label = this.translate.instant('GLOBAL.usuarios.' + this.formUsuario.campos[i].label_i18n);
      this.formUsuario.campos[i].placeholder = this.translate.instant('GLOBAL.usuarios.placeholder_' + this.formUsuario.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadOptionsTipoidentificacion(): void {
    let tipoidentificacion: Array<any> = [];
    this.usuariosService.get('tipo_identificacion')
      .subscribe(res => {
        if (res !== null) {
          tipoidentificacion = <Array<TipoIdentificacion>>res;
        }
        this.formUsuario.campos[this.getIndexForm('Tipoidentificacion')].opciones = tipoidentificacion;
      });
  }
  loadOptionsTipousuario(): void {
    let tipousuario: Array<any> = [];
    this.usuariosService.get('tipo_usuario')
      .subscribe(res => {
        if (res !== null) {
          tipousuario = <Array<TipoUsuario>>res;
        }
        this.formUsuario.campos[this.getIndexForm('Tipousuario')].opciones = tipousuario;
      });
  }
  loadOptionsEstadousuario(): void {
    let estadousuario: Array<any> = [];
    this.usuariosService.get('tipo_estado')
      .subscribe(res => {
        if (res !== null) {
          estadousuario = <Array<TipoEstado>>res;
        }
        this.formUsuario.campos[this.getIndexForm('Estadousuario')].opciones = estadousuario;
      });
  }
  /*
  loadOptionsUsuariosupervisa(): void {
    let usuariosupervisa: Array<any> = [];
    this.usuariosService.get(`supervisor/0/${this.tipoUsuario.Id}`)
      .subscribe(res => {
        if (res !== null) {
          usuariosupervisa = <Array<Supervisor>>res;
        }
        this.formUsuario.campos[this.getIndexForm('Usuariosupervisa')].opciones = usuariosupervisa;
      });
  }*/

  loadOptionsCoordinacionoerativa(): void {
    let coordinacionoperativa: Array<any> = [];
    this.usuariosService.get(`coordinacion/0/${this.tipoUsuario.Id}`)
      .subscribe(res => {
        if (res !== null) {
          coordinacionoperativa = <Array<Coordinacion>>res;
        }
        this.formUsuario.campos[this.getIndexForm('Coordinacionoperativa')].opciones = coordinacionoperativa;
      });
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formUsuario.campos.length; index++) {
      const element = this.formUsuario.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }


  public loadUsuario(): void {
    if (this.usuario_id !== undefined && this.usuario_id !== 0) {
      this.usuariosService.get('usuario/' + this.usuario_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_usuario = <Usuario>res;
          }
        });
    } else {
      this.info_usuario = undefined;
      this.clean = !this.clean;
    }
  }

  //accion del campo tipo usuario
  public selectTipoUsuario(event): void {
    this.tipoUsuario = event.valor;
    switch ((event.valor.NombreTipo.substring(0,7)).toLowerCase()) {
      
      case 'empresa':
        this.loadOptionsCoordinacionoerativa();
        (this.formUsuario.campos[this.getIndexForm('Coordinacionoperativa')]).requerido = true;
        (this.formUsuario.campos[this.getIndexForm('Coordinacionoperativa')]).ocultar = false;
       // delete (this.formUsuario.campos[this.getIndexForm('Usuariosupervisa')]).valor;
      break;
        default:
          (this.formUsuario.campos[this.getIndexForm('Coordinacionoperativa')]).requerido = false;
          (this.formUsuario.campos[this.getIndexForm('Coordinacionoperativa')]).ocultar = true;
          delete (this.formUsuario.campos[this.getIndexForm('Coordinacionoperativa')]).valor;
      break;    

/*

      case 'coordinador operativo':
        this.loadOptionsCoordinacionoerativa();
        (this.formUsuario.campos[this.getIndexForm('Coordinacionoperativa')]).requerido = true;
        (this.formUsuario.campos[this.getIndexForm('Coordinacionoperativa')]).ocultar = false;
        (this.formUsuario.campos[this.getIndexForm('Usuariosupervisa')]).requerido = false;
        (this.formUsuario.campos[this.getIndexForm('Usuariosupervisa')]).ocultar = true;
        delete (this.formUsuario.campos[this.getIndexForm('Usuariosupervisa')]).valor;
      break;
      default:
          (this.formUsuario.campos[this.getIndexForm('Usuariosupervisa')]).requerido = false;
          (this.formUsuario.campos[this.getIndexForm('Usuariosupervisa')]).ocultar = true;
          (this.formUsuario.campos[this.getIndexForm('Coordinacionoperativa')]).requerido = false;
          (this.formUsuario.campos[this.getIndexForm('Coordinacionoperativa')]).ocultar = true;
          delete (this.formUsuario.campos[this.getIndexForm('Coordinacionoperativa')]).valor;
          delete (this.formUsuario.campos[this.getIndexForm('Usuariosupervisa')]).valor;
        break;*/
    }
  //  console.info(event.valor);
  }

  updateUsuario(usuario: any): void {
    const opt: any = {
      title: 'Registro usuario',
      text: 'Seguro de actualizar el Usuario?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_usuario = <Usuario>usuario;
          this.usuariosService.putUser('usuario', this.info_usuario)
            .subscribe(res => {
              this.loadUsuario();
              this.eventChange.emit(true);
              this.showToast('info', 'Registro usuario', 'Usuario actualizado');
            });
        }
      });
  }

  createUsuario(usuario: any): void {

    var str = document.location.href; 
    let url= str.split("#", 1); 
    const opt: any = {
      title: 'Registro usuario',
      text: 'Registrar el usuario?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_usuario = <Usuario>usuario;
          this.info_usuario.Sistema='siveeic';
          this.info_usuario.Host=url[0];
          this.usuariosService.postUser('usuario', this.info_usuario)
            .subscribe(res => {
              this.info_usuario = <Usuario>res;

              //VERIFICA SI SE REGISTRO EL USUARIO;
              if(this.info_usuario === null )
                {
                  this.showToast('error', 'Usuario NO Registrado!', 'Nombre de usuario ya existe, intente de nuevo');
                  this.eventChange.emit(true);
                }
              else
                {
                  this.eventChange.emit(true);
                  this.showToast('info', 'Registro usuario', 'Usuario registrado exitosamente');
                }
            });
        }
      });
  }

  ngOnInit() {
    this.loadUsuario();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_usuario === undefined) {
        this.createUsuario(event.data.Usuario);
      } else {
        this.updateUsuario(event.data.Usuario);
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
