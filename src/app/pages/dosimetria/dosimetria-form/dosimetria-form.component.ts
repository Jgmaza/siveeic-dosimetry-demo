import { Component, OnInit, Input, Output, EventEmitter, ViewChild  } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

import { DosimetriaService } from '../../../@core/data/services/dosimetria.service';
import { DosimetriaView } from '../../../@core/data/models/dosimetria/dosimetria_view';
import { Dosimetria } from '../../../@core/data/models/dosimetria/dosimetria';
import { Operador } from '../../../@core/data/models/operador/operador';
import { Departamento } from './../../../@core/data/models/departamento';
import { Municipio } from './../../../@core/data/models/municipio';
import { Periodo } from '../../../@core/data/models/general/periodo';
import { Ciclo } from '../../../@core/data/models/dosimetria/ciclo';
import { TipoEstado } from './../../../@core/data/models/tipo_estado';
import { TipoDosimetro } from './../../../@core/data/models/dosimetria/tipo_dosimetro';
import { TecnoDosimetro } from './../../../@core/data/models/dosimetria/tecno_dosimetro';
import { PracticaRi } from './../../../@core/data/models/dosimetria/practica_ri';
import { Genero } from './../../../@core/data/models/genero';
import { NivelEducacion } from './../../../@core/data/models/nivel_educacion';



import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'app-dosimetria-form',
  templateUrl: './dosimetria-form.component.html',
  styleUrls: ['./dosimetria-form.component.scss'],
})
export class DosimetriaFormComponent implements OnInit {
  config: ToasterConfig;
  settings: any;

  uid: number;
  user_operador: number;

  createMode: boolean = true;
  registro: DosimetriaView;
  registroForm: FormGroup;
  /*variables para definir los selects de formulario */
  Operador = [];
  Periodo = [];
  Ciclo = [];
  Departamento = [];
  Municipio = [];
  Frecuencia_medicion = [];
  Frecuencia_cambio = [];

  Genero_empleado = [];
  Nivel_educacion = [];
  Tipo_dosimetro = [];
  Tecnologia_dosimetro = [];
  Practica_ri = [];

  /* */
  registro_id: number;
  /*variables para comparar con lo rescatado y seleccionar la opcion */
  selected_Operador: Operador;
  selected_Periodo: Periodo;
  selected_Ciclo: Ciclo;
  selected_Departamento: Departamento;
  selected_Municipio: Municipio;

  // selected_Municipio: Municipio;

  private myValidatorDate = (ctrl: FormControl): ValidationErrors | null => {
    const myDate = new Date(ctrl.value);
    return !ctrl.value || isNaN(myDate.getTime()) || myDate.getFullYear() > 9999 ? { dateInvalid: true } : null;
  }


  @Output() eventChange = new EventEmitter();

  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;

  info_medidor: Dosimetria;
  clean: boolean;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      public activeModal: NgbActiveModal,
      private registroService: DosimetriaService,
      private toasterService: ToasterService,
  ) {

  this.load_UserData();
  this.construirForm();
  this.loadOptionsOperador();
  this.loadOptionsCiclo();
  this.loadOptionsFrecuencia();
  this.loadOptionsCambio();
  this.loadOptionsPeriodoAnio();
  this.loadOptionsDepartamento();
  this.loadOptionsGenero();
  this.loadOptionsEducacion();
  this.loadOptionsPractica();
  this.loadOptionsDosimetro();
  this.loadOptionsTecnoDosimetro();
  // this.loadOptionsMunicipio();
  // this.loadOptionsEstadooperador();
 }

construirForm() {
  this.registroForm = this.formBuilder.group({
    Operador: [null, Validators.required],
    Periodo: [null, Validators.required],
    Ciclo: [null, Validators.required],
    Identificacion_entidad: ['',  Validators.compose([ Validators.required, Validators.minLength(4), Validators.maxLength(15), Validators.pattern('^[A-Za-z0-9-]+')]) ],
    Nombre_entidad: ['',  Validators.compose([ Validators.required, Validators.minLength(3), Validators.maxLength(100) ]) ],
    Direccion_entidad: ['',  Validators.compose([ Validators.required, Validators.minLength(3), Validators.maxLength(100) ]) ],
    Correo_entidad: ['',  Validators.compose([ Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.[a-z]+\.[a-z]+$') ]) ],
    Departamento: [null, Validators.required],
    Municipio: [{ value: '', disabled: true }, Validators.required],
   // Latitud: ["" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(20), Validators.pattern('^[-]*[0-9]*[.]*[0-9]*$')]) ],
   // Longitud: ["" , Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(20), Validators.pattern('^[-]*[0-9]*[.]*[0-9]*$')]) ],
    Identificacion_empleado: ['',  Validators.compose([ Validators.required, Validators.minLength(4), Validators.maxLength(15), Validators.pattern('^[A-Za-z0-9-]+')]) ],
    Nombre_empleado: ['',  Validators.compose([ Validators.required, Validators.minLength(3), Validators.maxLength(100) ]) ],
    Apellido_empleado: ['',  Validators.compose([ Validators.required, Validators.minLength(3), Validators.maxLength(100) ]) ],
    Fecha_nacimiento:  ['', Validators.compose([ Validators.minLength(10) , this.myValidatorDate ])],
    Genero_empleado: [null, Validators.required],
    Otro_Genero: [{ value: '', disabled: true },  Validators.compose([Validators.minLength(3), Validators.maxLength(255), Validators.pattern('^[a-zA-Z0-9_.,-\\s]+$') ]) ],
    Nivel_educacion: [null, Validators.required],
    Titulo: ['',  Validators.compose([ Validators.required, Validators.minLength(6), Validators.maxLength(100) ]) ],
    Fecha_inicio_exposicion_empleado: ['', Validators.compose([ Validators.minLength(10) , this.myValidatorDate ])],
    Fecha_fin_exposicion_empleado:  ['', Validators.compose([ Validators.minLength(10) , this.myValidatorDate ])],
    Frecuencia_medicion: [null, Validators.required],
    Frecuencia_cambio: [null, Validators.required],
    Practica_ri: [null, Validators.required],
    Tipo_dosimetro: [null, Validators.required],
    Tecnologia_dosimetro: [null, Validators.required],
    Hp_mSv_Enero: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(12), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Hp_mSv_Febrero: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(8), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Hp_mSv_Marzo: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(8), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Hp_mSv_Abril: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(8), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Hp_mSv_Mayo: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(8), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Hp_mSv_Junio: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(8), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Hp_mSv_Julio: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(8), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Hp_mSv_Agosto: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(8), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Hp_mSv_Septiembre: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(8), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Hp_mSv_Octubre: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(8), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Hp_mSv_Noviembre: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(8), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Hp_mSv_Diciembre: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(8), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Hp_acumulado: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(16), Validators.pattern('^([Nn][Rr])?(([0-9])?)+(\\.[0-9]{1,2})?$')]) ],
    Intervencion_Tejido_Profundo_Hp10: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(8), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Intervencion_Cristalino_Ojo_Hp3: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(8), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Intervencion_Extremidades_Piel_Hp007: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(8), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Intervencion_Observacion: ['',  Validators.compose([Validators.minLength(3), Validators.maxLength(1000) ]) ],
    Investigacion_Tejido_Profundo_Hp10: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(8), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Investigacion_Cristalino_Ojo_Hp3: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(8), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Investigacion_Extremidades_Piel_Hp007: ['NR' , Validators.compose([ Validators.required, Validators.minLength(1), Validators.maxLength(8), Validators.pattern('^([Nn][Rr])?(([0-9]{1,8})?)+(\\.[0-9]{1,2})?$')]) ],
    Investigacion_Observacion: ['',  Validators.compose([Validators.minLength(3), Validators.maxLength(1000) ]) ],

  });
}

  ngOnInit() {
    // carga los datos rescatados
    if (!this.createMode) {
      this.loadOptionsMunicipio();
      this.loadRegistro(this.registro_id);
    }
  }

  loadRegistro(registro_id) {
    let registro_info: Dosimetria;
    this.registroService.get('reportedosimetria/' + registro_id)
    .subscribe(res => {
      if (res !== null) {
        registro_info = <Dosimetria>res;
      //  console.info(registro_info)
        this.registroForm.patchValue(registro_info);

      }
    });
  }

    /*
    ### funcion para comparar y seleccionar la opcion, se coloca los siguiente en select de html
    ### [(ngModel)]="selected_Tipoidentificacion" [compareWith]="compareById"
    */
  compareById(o1, o2) {
      if (o1 == null || o2 == null) {
        return false;
      }
      return o1.Id === o2.Id;
    }


  saveRegistro() {
      if (this.registroForm.invalid) {
        return;
      }
        const registro = this.registroForm.value;
        registro.Usuarioreporta = this.uid;
        const data: Dosimetria = registro;
        if (this.createMode) {
          // let registro: Operador = this.registroForm.value;

          const opt: any = {
            title: 'Gestión reporte dosimetría',
            text: 'Seguro de guardar el reporte?, Recuerde que una vez se guarde, no se podrán modificar los datos.',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#6f8ec7', // '#DD6B55',
            confirmButtonText: 'Si, Guardar!',
            cancelButtonText: 'No, cancelar!',
            // buttons: true,
            // dangerMode: true,
            // showCancelButton: true,
          };
          Swal(opt)
            .then((willDelete) => {
              if (willDelete.value) {
                // verifica si el reporte ya existe
                this.registroService.get('reportedosimetria/0/' + parseInt(registro.Operador.Id, 10) + '/' + registro.Periodo.Id + '/' + registro.Identificacion_entidad + '/' + registro.Identificacion_empleado)
                .subscribe(res => {
                  if (Object.keys(res).length > 0) {
                      this.showToast('error', 'Gestión reporte dosimetría!', 'El reporte ya existe para el périodo, entidad y empleado.<br>Verifique los datos e intente de nuevo');
                      this.eventChange.emit(true);
                    } else {
                      // se guarda el reporte
                      this.registroService.postRegistro('reportedosimetria', data)
                      .subscribe(response => {
                        const resultado = <DosimetriaView>response;
                        // VERIFICA SI SE REGISTRO EL operador;
                        if (resultado === null ) {
                            this.showToast('error', 'Gestión reporte dosimetría!', 'No fue posible registrar el reporte, intente de nuevo');
                            this.eventChange.emit(true);
                          } else {
                            this.eventChange.emit(true);
                            this.showToast('info', 'Gestión reporte dosimetría', 'Reporte registrado exitosamente');
                            this.activeModal.close();
                          }
                      });
                    }
                });

              }
            });

      } else {
        /*
        //codigo para editar los registros
        const opt: any = {
          title: 'Gestionar operador',
          text: 'Seguro que desea de actualizar los datos del operador?',
          icon: 'warning',
          buttons: true,
          dangerMode: true,
          showCancelButton: true,
        };
        Swal(opt)
          .then((willDelete) => {
            if (willDelete.value) {
              registro.Id=this.registro_id;
              this.registroService.putRegistro('operador', registro)
                .subscribe(res => {
                      let resultado = <Operador>res;
                      //VERIFICA SI SE REGISTRO EL operador;
                      if(resultado === null )
                      {
                        this.showToast('error', 'Gestión operador!', 'No fue posible actualizar los datos del operador, intente de nuevo');
                        this.eventChange.emit(true);
                      }
                      else
                      {
                        this.eventChange.emit(true);
                        this.showToast('info', 'Gestión operador', 'Datos de operador actualizados, exitosamente!');
                        this.activeModal.close();
                      }
                });
            }
          });*/
      }

  }

  load_UserData(): void {
    // rescata el idoperador asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
      this.user_operador = user.operador;
      this.uid = user.id;
    });
   // console.info(this.user_operador);
  }

  loadOptionsOperador(): void {
    const operador: any = Operador;
    const endpoint = this.user_operador === 0
      ? 'operador_light'
      : ('operador/' + this.user_operador);
    this.registroService.get(endpoint)
      .subscribe(res => {
        if (res !== null) {
          this.Operador = <Array<Operador>>res;
          if (this.user_operador !== 0) {
              operador.Operador = this.Operador[0];
              this.registroForm.patchValue(operador);
            }
        }
      });
  }

  loadOptionsDepartamento(): void {
    const operador: Array<any> = [];
    this.registroService.get('departamento')
      .subscribe(res => {
        if (res !== null) {
          // console.info(res);
          this.Departamento = <Array<Departamento>>res;
        }
      });
  }

  selectMunicipio() {   const selecion = this.registroForm.get('Departamento').value;
      this.registroService.get('municipio/na/' + selecion.Id)
      .subscribe(res => {
        if (res !== null) {
          // console.info(res);
          this.Municipio = <Array<Municipio>>res;
          // console.log(this.Municipio[0]);
          this.selected_Municipio = this.Municipio[0];
          // this.registroForm.get('Municipio').disable();
          this.registroForm.get('Municipio').enable();
        }
      });

  }

  loadOptionsMunicipio(): void {
    const operador: Array<any> = [];
    this.registroService.get('municipio')
      .subscribe(res => {
        if (res !== null) {
          // console.info(res);
          this.Municipio = <Array<Municipio>>res;
        }
      });
  }

  loadOptionsPeriodoAnio(): void {
    const periodo: Array<any> = [];
    this.registroService.get('periodoanio/2000')
      .subscribe(res => {
        if (res !== null) {
         // console.info(res);
          this.Periodo = <Array<Periodo>>res;
        }
      });
  }

  loadOptionsPeriodo(): void {
    const periodo: Array<any> = [];
    this.registroService.get('periodo')
      .subscribe(res => {
        if (res !== null) {
         // console.info(res);
          this.Periodo = <Array<Periodo>>res;
        }
      });
  }

  loadOptionsCiclo(): void {
    const fuente: Array<any> = [];
    this.registroService.get('ciclodosimetria')
      .subscribe(res => {
        if (res !== null) {
          const ciclo  = <Array<Ciclo>>res;
          this.Ciclo = ciclo.filter( Ciclos => Ciclos.Nombre == 'Anual');
        }
      });
  }

  loadOptionsFrecuencia(): void {
    const fuente: Array<any> = [];
    this.registroService.get('ciclodosimetria')
      .subscribe(res => {
        if (res !== null) {
          this.Frecuencia_medicion  = <Array<Ciclo>>res;
        }
      });
  }

  loadOptionsCambio(): void {
    const estado = [];
    estado.push({'Id': 'NO','Nombre': 'NO'});
    estado.push({'Id': 'SI','Nombre': 'SI'});
    this.Frecuencia_cambio = estado;
    let cambio: any;
    // cambio.Frecuencia_cambio=[{"Id": "NO","Nombre": "NO"}];
    // this.registroForm.patchValue(cambio);

  }

  loadOptionsGenero(): void {
    const solucion: Array<any> = [];
    this.registroService.get('genero')
      .subscribe(res => {
        if (res !== null) {
          // console.info(res);
          this.Genero_empleado = <Array<Genero>>res;
        }
      });
  }

  loadOptionsEducacion(): void {
    const fuente: Array<any> = [];
    this.registroService.get('niveleducacion')
      .subscribe(res => {
        if (res !== null) {
          // console.info(res);
          this.Nivel_educacion = <Array<NivelEducacion>>res;
        }
      });
  }

  loadOptionsDosimetro(): void {
    const fuente: Array<any> = [];
    this.registroService.get('tipodosimetro')
      .subscribe(res => {
        if (res !== null) {
          // console.info(res);
          this.Tipo_dosimetro = <Array<TipoDosimetro>>res;
        }
      });
  }

  loadOptionsTecnoDosimetro(): void {
    const fuente: Array<any> = [];
    this.registroService.get('tecnodosimetro')
      .subscribe(res => {
        if (res !== null) {
          // console.info(res);
          this.Tecnologia_dosimetro = <Array<TecnoDosimetro>>res;
        }
      });
  }

  loadOptionsPractica(): void {
    const fuente: Array<any> = [];
    this.registroService.get('practicasri')
      .subscribe(res => {
        if (res !== null) {
          // console.info(res);
          this.Practica_ri = <Array<PracticaRi>>res;
        }
      });
  }

  selectGenero() {
      const selecion = this.registroForm.get('Genero_empleado').value;
      // console.info(selecion.Nombre)
      if (selecion.Nombre === 'Otro') { this.registroForm.get('Otro_Genero').enable();
          this.registroForm.get('Otro_Genero').setValue('');
        } else if (selecion.Nombre !== 'Otro') {
        this.registroForm.get('Otro_Genero').setValue(selecion.Nombre);
          this.registroForm.get('Otro_Genero').disable();
        }
   }

  validaValor(data): void {
    if (Number(data.value)) {
         this.registroForm.get(data.id).setValue(parseFloat(data.value).toFixed(2));
      } else {
        this.registroForm.get(data.id).setValue('NR');
      }
    }

  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
      positionClass: 'toast-top-center',
      timeout: 60000,  // ms
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
