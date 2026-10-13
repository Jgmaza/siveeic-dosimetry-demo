import { DinamicformComponent } from './../dinamicform/dinamicform.component';
import { LoaderService } from './../../../@core/utils/load.service';
import { Usuario } from './../../../@core/data/models/usuario';
import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ViewChild } from '@angular/core';
import { UsuariosService } from '../../../@core/data/usuarios.service';
import { FORM_FILTRO } from './form-filtro';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'ngx-filtro',
    template: `
    <div class="row">
        <div class="col-lg-12">
            <nb-card>
            <nb-card-body>
                <ngx-dinamicform #form [normalform]="formFiltro" [modeloData]="info_usuario"
                (result)="validarForm($event)" (interlaced)="selectTipoUsuario($event)" [clean]="clean">
                </ngx-dinamicform>
                <div class="row" align="left">
                  <div class="col-lg-2" align="left">
                  <button class="btn btn-success btn-sm" (click)="getFilter()" >
                  <i class="fa fa-search" aria-hidden="true"></i>Consultar</button>
                  </div>
                  <div class="col-lg-2" align="left">
                  <button class="btn btn-primary btn-sm"(click)="clear()" >
                  <i class="fa fa-eraser" aria-hidden="true"></i>Limpiar</button>
                 </div>
                </div>
            </nb-card-body>
            </nb-card>
        </div>
    </div>
    `,
})

export class FiltroComponent implements OnInit , AfterViewInit {
    config: ToasterConfig;
    usuario_id: number;
    path_complementario = { d: '0', m: '0',  c: '0', cp: '0', co: '0', ao: '0', uc: '0', ca: '0', sa: '0', e: '0'};
    @Input('campos') campos: any;
    @Input('usuario_id')
    @ViewChild('form') form: DinamicformComponent;
    user: any;
    set name(usuario_id: number) {
        this.usuario_id = usuario_id;
    }

    @Output() eventChange = new EventEmitter();

    info_usuario: Usuario;
    formFiltro: any;
    regUsuario: any;
    clean: boolean;

    constructor(private translate: TranslateService, private loading: LoaderService,
        private usuariosService: UsuariosService, private toasterService: ToasterService) {
        this.formFiltro = FORM_FILTRO;
        // this.usuariosService.user$
        // .subscribe((user: any) => {
        //     this.user = user;
        // })
        // this.loadOptionsCordinacionoperativa();
        // this.loadOptionsAreaoperativa();
    }

    initFiltro() {
        this.construirForm();
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            this.construirForm();
        });
        this.loadOptionsDepartamento();
      //  this.loadOptionsclases();
        this.loadOptionsCoordinador();
        this.loadOptionsUnidadcobertura();
        this.eventChange.next(this.path_complementario);
    }

    ngAfterViewInit() {
        this.initFiltro();
    }

    construirForm() {
        this.formFiltro.titulo = this.translate.instant('GLOBAL.usuario');
        this.formFiltro.btn = this.translate.instant('GLOBAL.guardar');
        // this.formFiltro.campos = this.formFiltro.campos.filter((data: any) => (this.campos.indexOf(data.nombre) !== -1));
        this.formFiltro.campos = this.formFiltro.campos.map((campo: any) => {
            return {
                ... campo,
                ... { label: this.translate.instant('GLOBAL.' + campo.label_i18n)},
                ... { placeholder: this.translate.instant('GLOBAL.placeholder_' + campo.label_i18n)},
                ... { ocultar: this.campos.indexOf(campo.nombre) !== -1 ? false : true },
            }
        });
    }

    useLanguage(language: string) {
        this.translate.use(language);
    }

    loadOptionsDepartamento(): void {
        this.loadOptionGeneral('Departamento', 'departamento')
    }

    loadOptionsMunicipio(): void {
        this.loadOptionGeneral('Municipio', 'municipios', `${this.path_complementario.d}`);
    }

    loadOptionsclases(): void {
        this.loadOptionGeneral('Clase', 'clases', `${this.path_complementario.d}/${this.path_complementario.m}`);
    }

    loadOptionsCentropoblado(): void {
        this.loadOptionGeneral('Centropoblado', 'centropoblado', `${this.path_complementario.d}/${this.path_complementario.m}/${this.path_complementario.c}`);
    }

    loadOptionsCordinacionoperativa(): void {
        this.loadOptionGeneral('Cordinacionoperativa', 'coordinacionop', `${this.path_complementario.d}/${this.path_complementario.m}/${this.path_complementario.c}/${this.path_complementario.cp}`);
    }

    loadOptionsAreaoperativa(): void {
        this.loadOptionGeneral('Areaoperativa', 'areaop', `${this.path_complementario.d}/${this.path_complementario.m}/${this.path_complementario.c}/${this.path_complementario.cp}/${this.path_complementario.co}`);
    }

    loadOptionsUnidadcobertura(): void {
       this.usuariosService.user$
       .subscribe((user: any) => {
           this.user = user;
       });
        this.formFiltro.campos[this.getIndexForm('Unidadcobertura')].path = environment.USUARIOS_SERVICE + `unidadcobertura/`+this.user +
        `/${this.path_complementario.d}/${this.path_complementario.m}/${this.path_complementario.c}/${this.path_complementario.cp}/${this.path_complementario.co}/${this.path_complementario.ao}`;

    }

    loadOptionsCoordinador(): void {
        this.loadOptionGeneral('Coordinador', 'coordinadorarea',
        `${this.path_complementario.d}/${this.path_complementario.m}/${this.path_complementario.c}/${this.path_complementario.cp}/${this.path_complementario.co}/${this.path_complementario.ao}`);
    }

    loadOptionsSupervisor(): void {
        this.loadOptionGeneral('Supervisor', 'supervisorarea' , `${this.path_complementario.ca}/${this.path_complementario.d}/${this.path_complementario.m}/${this.path_complementario.c}/${this.path_complementario.cp}/${this.path_complementario.co}/${this.path_complementario.ao}`);
    }

    loadOptionsEncuestador(): void {
        this.loadOptionGeneral('Encuestador', 'encuestador' , `${this.path_complementario.ca}/${this.path_complementario.sa}/${this.path_complementario.d}/${this.path_complementario.m}/${this.path_complementario.c}/${this.path_complementario.cp}/${this.path_complementario.co}/${this.path_complementario.ao}`);
    }

    loadOptionGeneral(index: string, endpoint: string, path: string = '') {
        let data: Array<any> = [];
        this.loading.show();
        this.formFiltro.campos[this.getIndexForm(index)].opciones = data;
        this.usuariosService.getOptions(endpoint, path)
            .subscribe(res => {
                if (res !== null) {
                    data = <Array<any>>res;
                }
                this.loading.hide();
                this.formFiltro.campos[this.getIndexForm(index)].opciones = data;
            });
    }

    getIndexForm(nombre: String): number {
        for (let index = 0; index < this.formFiltro.campos.length; index++) {
            const element = this.formFiltro.campos[index];
            if (element.nombre === nombre) {
                return index
            }
        }
        return 0;
    }


    public selectTipoUsuario(event: any): void {
        //console.info(event)
        switch (event.tipo) {
            case 'departamento':
                this.path_complementario.d = event.valor.Id + ''
                this.loadOptionsMunicipio();
                this.loadOptionsclases();
                this.loadOptionsCentropoblado();
                this.loadOptionsCordinacionoperativa();
                this.loadOptionsAreaoperativa();
                this.loadOptionsUnidadcobertura();

                this.loadOptionsCoordinador();
                this.loadOptionsSupervisor();
                this.loadOptionsEncuestador();

                break;
            case 'municipio':
                this.path_complementario.m = event.valor.Id + ''
                this.loadOptionsclases();
                this.loadOptionsCentropoblado();
                this.loadOptionsCordinacionoperativa();
                this.loadOptionsAreaoperativa();
                this.loadOptionsUnidadcobertura();

                this.loadOptionsCoordinador();
                this.loadOptionsSupervisor();
                this.loadOptionsEncuestador();
                break;
            case 'clase':
                this.path_complementario.c = event.valor.Id + ''
                this.loadOptionsCentropoblado();
                this.loadOptionsCordinacionoperativa();
                this.loadOptionsAreaoperativa();
                this.loadOptionsUnidadcobertura();

                this.loadOptionsCoordinador();
                this.loadOptionsSupervisor();
                this.loadOptionsEncuestador();

                break;
            case 'centropoblado':
                this.path_complementario.cp = event.valor.Id + ''
                this.loadOptionsCordinacionoperativa();
                this.loadOptionsAreaoperativa();
                this.loadOptionsUnidadcobertura();

                this.loadOptionsCoordinador();
                this.loadOptionsSupervisor();
                this.loadOptionsEncuestador();

                break;
            case 'cordinacionoperativa':
                this.path_complementario.co = event.valor.Id + ''
                this.loadOptionsAreaoperativa();
                this.loadOptionsUnidadcobertura();

                this.loadOptionsCoordinador();
                this.loadOptionsSupervisor();
                this.loadOptionsEncuestador();

                break;
            case 'areaoperativa':
                this.path_complementario.ao = event.valor.Id + ''
                this.loadOptionsUnidadcobertura();

                this.loadOptionsCoordinador();
                this.loadOptionsSupervisor();
                this.loadOptionsEncuestador();

                break;
            case 'unidadcobertura':
                this.path_complementario.uc = event.valor.Id + ''
                this.loadOptionsCoordinador();
                this.loadOptionsSupervisor();
                this.loadOptionsEncuestador();

                break;

            case 'coordinador':
                this.path_complementario.ca = event.valor.Id + ''
                this.loadOptionsSupervisor();
                this.loadOptionsEncuestador();
                break;
            case 'supervisor':
                this.path_complementario.sa = event.valor.Id + ''
                this.loadOptionsEncuestador();
                break;
            case 'encuestador':
                this.path_complementario.e = event.valor.Id + ''
                break;

            default:
                break;
        }
    }

    getFilter() {
        this.eventChange.next(this.path_complementario);
    }

    clear() {
        // this.initFiltro();
        this.form.clearForm();
        this.path_complementario = { d: '0', m: '0',  c: '0', cp: '0', co: '0', ao: '0', uc: '0', ca: '0', sa: '0', e: '0'};
        this.eventChange.next(this.path_complementario);
    }

    updateUsuario(usuario: any): void {

        const opt: any = {
            title: 'Update?',
            text: 'Update Usuario!',
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
                            this.eventChange.emit(true);
                            this.showToast('info', 'updated', 'Usuario updated');
                        });
                }
            });
    }



    createUsuario(usuario: any): void {
        const opt: any = {
            title: 'Create?',
            text: 'Create Usuario!',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
            showCancelButton: true,
        };
        Swal(opt)
            .then((willDelete) => {
                if (willDelete.value) {
                    this.info_usuario = <Usuario>usuario;
                    this.usuariosService.postUser('usuario', this.info_usuario)
                        .subscribe(res => {
                            this.info_usuario = <Usuario>res;
                            this.eventChange.emit(true);
                            this.showToast('info', 'created', 'Usuario created');
                        });
                }
            });
    }

    ngOnInit() {
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
