import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalDataSource } from 'ng2-smart-table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { DosimetriaService } from '../../../@core/data/services/dosimetria.service';
import { ExcelServicesService } from '../../../@core/data/excel-services.service';
import { DosimetriaView } from '../../../@core/data/models/dosimetria/dosimetria_view';
import { DosimetriaFormComponent } from '../dosimetria-form/dosimetria-form.component';
import { DosimetriaUploadComponent } from '../dosimetria-upload/dosimetria-upload.component';
import { Operador } from '../../../@core/data/models/operador/operador';
import { Departamento } from './../../../@core/data/models/departamento';
import { Municipio } from './../../../@core/data/models/municipio';
import { Periodo } from '../../../@core/data/models/general/periodo';
import { Periodoanio } from '../../../@core/data/models/general/periodoanio';
import { Ciclo } from '../../../@core/data/models/dosimetria/ciclo';
import { UtilidadesService } from '../../../@core/utils/utilidades.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

function cellText(value: any): string {
  if (value == null) { return ''; }
  if (typeof value === 'object') {
    return value.Nombreoperador || value.Nombre || value.NombreDepartamento
      || value.NombreMunicipio || value.NombreEstado || '';
  }
  return String(value);
}

function matchesFilter(cell: any, search?: string): boolean {
  if (search == null || search === '') { return true; }
  return cellText(cell).toLowerCase().indexOf(String(search).toLowerCase()) !== -1;
}

@Component({
  selector: 'app-dosimetria-list',
  templateUrl: './dosimetria-list.component.html',
  styleUrls: ['./dosimetria-list.component.scss']
})
export class DosimetriaListComponent implements OnInit, OnDestroy {
  user_operador: number;
  uid: number;
  cambiotab: boolean = false;
  config: ToasterConfig;
  settings: any;
  excel=[];
  source: LocalDataSource = new LocalDataSource();  
  rowspage:any;
  isAdmin:boolean=false;
  loading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 200;
  totalRows: number = 0;
  totalPages: number = 0;
  q: string = '';
  private searchSub: Subscription;
  private dataSub: Subscription;
 
  filtrarForm: FormGroup;
  registroForm: FormGroup;
  /*variables para definir los selects de formulario */
  Operador = [];
  Anio = [];
  Periodo = [];
  Ciclo = [];
  Departamento = [];
  Municipio = [];
  utilidadesService: UtilidadesService = new UtilidadesService();


  constructor(private modalService: NgbModal, private translate: TranslateService, private registroService: DosimetriaService,
      private toasterService: ToasterService, private excelService:ExcelServicesService,
      private formBuilder: FormBuilder, private router: Router) {
    this.construirForm();
    this.load_UserData();
    this.loadOptionsCiclo();
    this.loadOptionsPeriodo();
    this.loadOptionsDepartamento();
    //this.loadData();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  construirForm() {
    this.filtrarForm = this.formBuilder.group({
      Operador: [null],
      Ciclo: [null],
      Periodo: [null],
      Identificacion_empleado: ['',  Validators.compose([Validators.minLength(4),Validators.maxLength(15), Validators.pattern('^[A-Za-z0-9-]+')]) ],
      Departamento: [null],
      Municipio: [{ value: "", disabled: true }],
    });

    this.registroForm = this.formBuilder.group({
      Rowspage: [200],
      Q: [''],
    });
  }

  download(){
    const link = document.createElement('a');
    link.href = 'assets/formatos/Formato_Reporte_Dosimetria.xlsx';
    link.download = 'Formato_Reporte_Dosimetria.xlsx';
    link.click();
  }

  downloadInstrucciones(){
    const link = document.createElement('a');
    link.href = 'assets/formatos/instrucciones.pdf';
    link.download = 'Instrucciones.pdf';
    link.click();
  }

  paginas(): void {
    const selected = Number(this.registroForm.get('Rowspage').value) || 200;
    this.pageSize = Math.min(Math.max(selected, 1), 200);
    this.currentPage = 1;
    this.syncTablePager();
    this.loadData();
  }

  private syncTablePager(): void {
    this.settings = Object.assign({}, this.settings, {
      pager: { perPage: this.pageSize, display: false },
    });
    this.source.setPaging(1, this.pageSize, false);
  }

  get totalPagesDisplay(): number {
    return this.totalPages > 0 ? this.totalPages : 1;
  }

  goToPage(page: number): void {
    const target = Math.min(Math.max(page, 1), this.totalPagesDisplay);
    if (target === this.currentPage && this.totalRows > 0) { return; }
    this.currentPage = target;
    this.loadData();
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  firstPage(): void {
    this.goToPage(1);
  }

  lastPage(): void {
    this.goToPage(this.totalPagesDisplay);
  }

  goToPageFromInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const page = parseInt(input.value, 10);
    if (!Number.isNaN(page)) {
      this.goToPage(page);
    }
    input.value = String(this.currentPage);
  }

  buscar(): void {
    this.currentPage = 1;
    this.q = (this.registroForm.get('Q') && this.registroForm.get('Q').value) || '';
    this.loadData();
  }

  private setupSearchDebounce(): void {
    const qControl = this.registroForm.get('Q');
    if (!qControl) { return; }
    this.searchSub = qControl.valueChanges.pipe(
      debounceTime(400),
      map((value: string) => (value || '').trim()),
      distinctUntilChanged(),
    ).subscribe((value: string) => {
      this.q = value;
      this.currentPage = 1;
      this.loadData();
    });
  }

  cargarCampos() {

    let permiso=true;
    if(this.user_operador===0)
        {permiso=false;}

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
        deleteButtonContent: '<i class="nb-trash"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      //activa inactiva botones
      actions: { add: permiso,edit: false,delete: permiso 
       },
      mode: 'external',
      hideSubHeader: true,
      pager: { perPage: 200, display: false },
      columns: {
        // Id: {
        //   title: this.translate.instant('GLOBAL.operador.id'),
        //   // type: 'number;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        Operador: {
          title: this.translate.instant('GLOBAL.dosimetria.operador'),
          valuePrepareFunction: (value) => cellText(value),
          filterFunction: (cell?: any, search?: string): boolean => matchesFilter(cell && cell.Nombreoperador, search),
        },
        Periodo: {
          title: this.translate.instant('GLOBAL.dosimetria.periodo'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Ciclo: {
          title: this.translate.instant('GLOBAL.dosimetria.ciclo'),
          valuePrepareFunction: (value) => cellText(value),
          filterFunction: (cell?: any, search?: string): boolean => matchesFilter(cell && cell.Nombre, search),
        },
        Identificacionentidad: {
          title: this.translate.instant('GLOBAL.dosimetria.identificacion_entidad'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Nombreentidad: {
          title: this.translate.instant('GLOBAL.dosimetria.nombre_entidad'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Departamento: {
          title: this.translate.instant('GLOBAL.dosimetria.departamento'),
          valuePrepareFunction: (value) => (value && value.NombreDepartamento) ? value.NombreDepartamento : '',
          filterFunction: (cell?: any, search?: string): boolean => matchesFilter(cell && (cell.NombreDepartamento || cell.Nombredepartamento), search),
        },
        Municipio: {
          title: this.translate.instant('GLOBAL.dosimetria.municipio'),
          valuePrepareFunction: (value) => (value && value.NombreMunicipio) ? value.NombreMunicipio : '',
          filterFunction: (cell?: any, search?: string): boolean => matchesFilter(cell && (cell.NombreMunicipio || cell.Nombremunicipio), search),
        },
        Direccionentidad: {
          title: this.translate.instant('GLOBAL.dosimetria.direccion_entidad'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatString(value);
          },
        },
        Correoentidad: {
          title: this.translate.instant('GLOBAL.dosimetria.correo_entidad'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatString(value);
          },
        },
        Identificacionempleado: {
          title: this.translate.instant('GLOBAL.dosimetria.identificacion_empleado'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatString(value);
          },
        },
        Nombreempleado: {
          title: this.translate.instant('GLOBAL.dosimetria.nombre_empleado'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatString(value);
          },
        },
        Apellidoempleado: {
          title: this.translate.instant('GLOBAL.dosimetria.apellido_empleado'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatString(value);
          },
        },
        Fecha_nacimiento: {
          title: this.translate.instant('GLOBAL.dosimetria.fecha_nacimiento'),
          // type: 'Date;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatDate(value);
          },
        },
        Genero_empleado: {
          title: this.translate.instant('GLOBAL.dosimetria.genero_empleado'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatString(value);
          },
        },
        Nivel_educacion: {
          title: this.translate.instant('GLOBAL.dosimetria.nivel_educacion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatString(value);
          },
        },
        Titulo: {
          title: this.translate.instant('GLOBAL.dosimetria.titulo_educacion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatString(value);
          },
        },
        Fecha_inicio_exposicion_empleado: {
          title: this.translate.instant('GLOBAL.dosimetria.fecha_inicio_exposicion_empleado'),
          // type: 'Date;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatDate(value);
          },
        },
        Fecha_fin_exposicion_empleado: {
          title: this.translate.instant('GLOBAL.dosimetria.fecha_fin_exposicion_empleado'),
          // type: 'Date;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatDate(value);
          },
        },
        Frecuencia_medicion: {
          title: this.translate.instant('GLOBAL.dosimetria.frecuencia_medicion'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatString(value);
          },
        },
        Frecuencia_cambio: {
          title: this.translate.instant('GLOBAL.dosimetria.frecuencia_cambio'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatString(value);
          },
        },

        Practica_ri: {
          title: this.translate.instant('GLOBAL.dosimetria.practica_ri'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatString(value);
          },
        },
        Tipo_dosimetro: {
          title: this.translate.instant('GLOBAL.dosimetria.tipo_dosimetro'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatString(value);
          },
        },
        Tecnologia_dosimetro: {
          title: this.translate.instant('GLOBAL.dosimetria.tecnologia_dosimetro'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatString(value);
          },
        },
        Hp_mSv_Enero: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Enero'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatDosisMes(value);
          },
        },
        Hp_mSv_Febrero: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Febrero'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatDosisMes(value);
          },
        },
        Hp_mSv_Marzo: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Marzo'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatDosisMes(value);
          },
        },
        Hp_mSv_Abril: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Abril'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatDosisMes(value);
          },
        },
        Hp_mSv_Mayo: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Mayo'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatDosisMes(value);
          },
        },
        Hp_mSv_Junio: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Junio'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatDosisMes(value);
          },
        },
        Hp_mSv_Julio: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Julio'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatDosisMes(value);
          },
        },
        Hp_mSv_Agosto: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Agosto'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatDosisMes(value);
          },
        },
        Hp_mSv_Septiembre: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Septiembre'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatDosisMes(value);
          },
        },
        Hp_mSv_Octubre: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Octubre'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatDosisMes(value);
          },
        },
        Hp_mSv_Noviembre: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Noviembre'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatDosisMes(value);
          },
        },
        Hp_mSv_Diciembre: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_mSv_Diciembre'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatDosisMes(value);
          },
        },
        Total_mSv: {
          title: this.translate.instant('GLOBAL.dosimetria.total_mSv'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatNumber(value);
          },
        },
        Hp_acumulado: {
          title: this.translate.instant('GLOBAL.dosimetria.hp_acumulado'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatNumber(value);
          },
        },
        Latitud: {
          title: this.translate.instant('GLOBAL.dosimetria.latitud'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Longitud: {
          title: this.translate.instant('GLOBAL.dosimetria.longitud'),
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Estadoreporte: {
          title: this.translate.instant('GLOBAL.dosimetria.estadoreporte'),
          valuePrepareFunction: (value) => (value && value.NombreEstado) ? value.NombreEstado : '',
          filterFunction: (cell?: any, search?: string): boolean => matchesFilter(cell && cell.NombreEstado, search),
        },
        Fechacreacion: {
          title: this.translate.instant('GLOBAL.dosimetria.fechacreacion'),
          // type: 'Date;',
          valuePrepareFunction: (value) => {
            return this.utilidadesService.formatDate(value);
          },
        },
      },
    };
  }

  load_UserData(): void {
    // rescata el idoperador asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
      console.log("user", user);
      this.user_operador = user.operador;
      this.uid = user.id;
      this.isAdmin = user.role === 1;
      if (this.isAdmin) {
        this.router.navigate(['/pages/dosimetria/reportes-dosimetria']);
        return;
      }
      this.loadOptionsOperador();
    });
    //console.info(this.user_operador);
  }  

  compareById(o1,o2){
    if(o1 == null || o2 == null){
      return false;
    }
    return o1.Id === o2.Id;
  }

  loadOptionsOperador(): void {
    let operador: any = Operador;
    const endpoint = this.user_operador === 0
      ? 'operador_light'
      : ('operador/' + this.user_operador);
    this.registroService.get(endpoint)
      .subscribe(res => {
        if (res !== null) {
          this.Operador = <Array<Operador>>res;
          if (this.user_operador !== 0) {
              operador.Operador = this.Operador[0];
              this.filtrarForm.patchValue(operador);
            }
        }
      });
  }  

  loadOptionsAnio(): void {
    this.registroService.get('periodoaniodosi')
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          this.Anio = <Array<Periodoanio>>res;
        }
      });
  } 

  loadOptionsPeriodo(): void {
    let periodo: Array<any> = [];
    this.registroService.get('periododosi')
      .subscribe(res => {
        if (res !== null) {
         // console.info(res);
          this.Periodo = <Array<Periodo>>res;
        }
      });
  }      

  loadOptionsCiclo(): void {
    let fuente: Array<any> = [];
    this.registroService.get('ciclodosimetria')
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          let ciclo = <Array<Ciclo>>res;
          this.Ciclo = ciclo.filter( Ciclos => Ciclos.Nombre == 'Anual');
        }
      });
  } 

  loadOptionsDepartamento(): void {
    this.registroService.get('departamento')
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          this.Departamento = <Array<Departamento>>res;
        }
      });
  }    

  loadOptionsMunicipio(): void {

    this.filtrarForm.get('Municipio').enable();
    this.registroService.get('municipio')
      .subscribe(res => {
        if (res !== null) {
          //console.info(res);
          this.Municipio = <Array<Municipio>>res;
        }
      });
  }   
  
  selectMunicipio()
  {   
    let municipio: any=Municipio;
      let selecion=this.filtrarForm.get('Departamento').value;
      this.registroService.get('municipio/na/'+selecion.Id)
      .subscribe(res => {
        if (res !== null) {
          this.Municipio = <Array<Municipio>>res;
          //se selleciona la opcion por defecto
          //municipio.Municipio=this.Municipio[0];
          municipio.Municipio=0;
          this.filtrarForm.patchValue(municipio);
          //habilitar el campo
          this.filtrarForm.get('Municipio').enable();
        }
      });
  }

  Limpiar()
  {   
      let limpiar={"Departamento":null,"Municipio":null,"Ciclo":null,"Periodo":null,"Identificacion_empleado":null,};
      if(this.user_operador==0) {
             limpiar["Operador"]=null;
            }
      this.filtrarForm.patchValue(limpiar);
      this.registroForm.patchValue({ Q: '' }, { emitEvent: false });
      this.q = '';
      this.currentPage = 1;
      this.totalRows = 0;
      this.totalPages = 0;
      this.source.load([]);
      this.excel = [];
  }


  loadData(): void {
    if (this.dataSub) {
      this.dataSub.unsubscribe();
      this.dataSub = null;
    }

    let filtros = this.filtrarForm.value;
    let operador=0;
    let periodo=0;
    let depto=0;
    let municipio=0;
    let id_empleado=0;

    if(this.user_operador!==0) {
      operador=this.user_operador;
    } else if(filtros.Operador!==null) {
      operador=filtros.Operador.Id;
    }

    if(filtros.Periodo!==null) {periodo=filtros.Periodo.Id;}

    if(filtros.Departamento!==null) {
      depto=filtros.Departamento.Id;
      const mun = filtros.Municipio;
      municipio = (mun && typeof mun === 'object' && mun.Id) ? mun.Id : 0;
    }

    if(filtros.Identificacion_empleado!==null && filtros.Identificacion_empleado!=='') {id_empleado=filtros.Identificacion_empleado;}

    this.q = (this.registroForm.get('Q') && this.registroForm.get('Q').value) || this.q || '';
    const pageSize = Math.min(Math.max(Number(this.registroForm.get('Rowspage').value) || this.pageSize || 200, 1), 200);
    this.pageSize = pageSize;
    this.syncTablePager();

    const queryParams: { [key: string]: string | number } = {
      page: this.currentPage,
      pageSize,
    };
    if (this.q) { queryParams.q = String(this.q).trim(); }
    if (filtros.Ciclo !== null) { queryParams.Ciclo = filtros.Ciclo.Id; }

    this.loading = true;
    const endpoint = 'reportedosimetria/0/' + operador + '/' + periodo + '/0/' + id_empleado + '/' + depto + '/' + municipio;
    this.dataSub = this.registroService.getWithParams(endpoint, queryParams).subscribe(res => {
      this.loading = false;
      if (res !== null) {
        const payload: any = res;
        const data = <Array<any>>(Array.isArray(payload) ? payload : (payload.data || []));
        this.totalRows = Array.isArray(payload) ? data.length : (payload.total || 0);
        this.currentPage = Array.isArray(payload) ? 1 : (payload.page || this.currentPage);
        this.pageSize = Array.isArray(payload) ? data.length : (payload.pageSize || this.pageSize);
        this.totalPages = this.pageSize > 0 ? Math.ceil(this.totalRows / this.pageSize) : 0;

        for(var i = 0; i < data.length;i++){
           if (data[i].Datosempleado) {
            data[i].Fecha_nacimiento=data[i].fecha_nacimiento;
            data[i].Genero_empleado=data[i].Datosempleado.Genero_empleado && data[i].Datosempleado.Genero_empleado.Nombre;
            data[i].Nivel_educacion=data[i].Datosempleado.Nivel_educacion && data[i].Datosempleado.Nivel_educacion.Nombre;
            data[i].Titulo=data[i].Datosempleado.Titulo;
           }

            
            if (data[i].Reportedosimetria) {
              data[i].Fecha_inicio_exposicion_empleado=data[i].fecha_inicio_exposicion;
              data[i].Fecha_fin_exposicion_empleado=data[i].fecha_fin_exposicion;
              data[i].Frecuencia_medicion=data[i].FrecuenciaMedicion,
              data[i].Frecuencia_cambio=data[i].frecuencia_cambio,
              data[i].Practica_ri=data[i].PracticaRI ? data[i].PracticaRI : "";
              data[i].Tipo_dosimetro=data[i].TipoDosimetro
              data[i].Tecnologia_dosimetro=data[i].TecnologiaDosimetro;


              data[i].Hp_mSv_Enero=  data[i].Reportedosimetria.Hp_mSv_Enero;
              data[i].Hp_mSv_Febrero=data[i].Reportedosimetria.Hp_mSv_Febrero;
              data[i].Hp_mSv_Marzo=data[i].Reportedosimetria.Hp_mSv_Marzo;
              data[i].Hp_mSv_Abril=data[i].Reportedosimetria.Hp_mSv_Abril;
              data[i].Hp_mSv_Mayo=data[i].Reportedosimetria.Hp_mSv_Mayo;
              data[i].Hp_mSv_Junio=data[i].Reportedosimetria.Hp_mSv_Junio;
              data[i].Hp_mSv_Julio=data[i].Reportedosimetria.Hp_mSv_Julio;
              data[i].Hp_mSv_Agosto=data[i].Reportedosimetria.Hp_mSv_Agosto;
              data[i].Hp_mSv_Septiembre=data[i].Reportedosimetria.Hp_mSv_Septiembre;
              data[i].Hp_mSv_Octubre=data[i].Reportedosimetria.Hp_mSv_Octubre;
              data[i].Hp_mSv_Noviembre=data[i].Reportedosimetria.Hp_mSv_Noviembre;
              data[i].Hp_mSv_Diciembre=data[i].Reportedosimetria.Hp_mSv_Diciembre;

              data[i].Total_mSv = data[i].Reportedosimetria.Total_mSv != null
                ? data[i].Reportedosimetria.Total_mSv
                : data[i].total_mSv;
              data[i].Hp_acumulado=data[i].Reportedosimetria.Hp_acumulado != null
                ? data[i].Reportedosimetria.Hp_acumulado
                : data[i].hp_acumulado;
            }
          }

         this.source.load(data);
         this.source.setPaging(1, this.pageSize, true);
        this.excel=[];
        let arrayText:any;
        data.forEach(row => {

        arrayText = {
            Operador_Enegia: row.Operador && row.Operador.Nombreoperador,
            Periodo_Reporte: row.Periodo,
            Nit_Entidad: row.Identificacionentidad,
            Nombre_Entidad: row.Nombreentidad,
            Municipio_Entidad: !row.Municipio || row.Municipio.NombreMunicipio == "Todos" ? "NR" : row.Municipio.NombreMunicipio,
            Codigo_Municipio: !row.Municipio || row.Municipio.Codigo == "Todos" ? "NR" : row.Municipio.Codigo,
            Codigo_Departamento: row.Departamento ? row.Departamento.Codigo : "NR",
            Direccion_Entidad: row.Direccionentidad,
            Correo_Entidad: row.Correoentidad,
            

            Documento_Trabajador: row.Identificacionempleado,
            Nombres_Trabajador: row.Nombreempleado,
            Apellidos_Trabajador: row.Apellidoempleado,
            Fecha_nacimiento_Trabajador:row.Fecha_nacimiento,
            Genero_Trabajador:row.Genero_empleado,
            Nivel_educacion_Trabajador:row.Nivel_educacion == "No reporta" ? "NR" : row.Nivel_educacion,
            Titulo_Trabajador:row.Titulo,

            Fecha_inicio_exposicion_Trabajador:row.Fecha_inicio_exposicion_empleado,
            Fecha_fin_exposicion_Trabajador:row.Fecha_fin_exposicion_empleado,
	          Frecuencia_medicion:row.Frecuencia_medicion == "No reporta" ? "NR" : row.Frecuencia_medicion,
            Modifica_frecuencia_medicion:row.Frecuencia_cambio,
            Practica_RI:row.Practica_ri,
            Tipo_dosimetro:row.Tipo_dosimetro,
            Tecnologia_dosimetro:row.Tecnologia_dosimetro,
            Hp_mSv_Enero: this.utilidadesService.formatDosisMes(row.Hp_mSv_Enero),
            Hp_mSv_Febrero: this.utilidadesService.formatDosisMes(row.Hp_mSv_Febrero),
            Hp_mSv_Marzo: this.utilidadesService.formatDosisMes(row.Hp_mSv_Marzo),
            Hp_mSv_Abril: this.utilidadesService.formatDosisMes(row.Hp_mSv_Abril),
            Hp_mSv_Mayo: this.utilidadesService.formatDosisMes(row.Hp_mSv_Mayo),
            Hp_mSv_Junio: this.utilidadesService.formatDosisMes(row.Hp_mSv_Junio),
            Hp_mSv_Julio: this.utilidadesService.formatDosisMes(row.Hp_mSv_Julio),
            Hp_mSv_Agosto: this.utilidadesService.formatDosisMes(row.Hp_mSv_Agosto),
            Hp_mSv_Septiembre: this.utilidadesService.formatDosisMes(row.Hp_mSv_Septiembre),
            Hp_mSv_Octubre: this.utilidadesService.formatDosisMes(row.Hp_mSv_Octubre),
            Hp_mSv_Noviembre: this.utilidadesService.formatDosisMes(row.Hp_mSv_Noviembre),
            Hp_mSv_Diciembre: this.utilidadesService.formatDosisMes(row.Hp_mSv_Diciembre),
            Total_mSv: this.utilidadesService.formatNumber(row.Total_mSv),
            Hp_Acumulado: this.utilidadesService.formatNumber(row.Hp_acumulado),
            Observaciones_dosis_de_notificacion:row.Intervencion_Observacion,
            Observaciones_generales:row.Investigacion_Observacion,
        }    
        this.excel.push(arrayText);
        });
      }
    }, () => {
      this.loading = false;
      this.source.load([]);
    });
  }

  ngOnInit() {
    this.setupSearchDebounce();
  }

  ngOnDestroy() {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
  }

 registros: DosimetriaView[] = [];
onCreate(event) {
    const modal = this.modalService.open(DosimetriaFormComponent,{windowClass:"my-class"});
    modal.result.then((data) => {
      this.loadData(); // on close
    }, (reason) => {
      // on dismiss
      this.handleModalDosimetriaFormClose.bind(this),
      this.handleModalDosimetriaFormClose.bind(this)
    });
}

onUpload(event) {
  this.clearToasts();
  if(this.user_operador===0)
      {   const opt: any = {
            title: 'Gestión reporte dosimetría',
            text: `No tiene permiso parta realizar esta acción `,
            type: 'warning',
            showCancelButton: false,
            confirmButtonColor: '#6f8ec7',//'#DD6B55',
            confirmButtonText: 'Aceptar!',
            cancelButtonText: "No, cancelar!",
            //buttons: true,
            //dangerMode: true,
          };
          Swal(opt)
          .then((willDelete) => {
            if (willDelete.value) {
            }
          });
      
      }
  else{
        const modal = this.modalService.open(DosimetriaUploadComponent,{windowClass:"my-class"});
        modal.result.then((data) => {
          this.loadData(); // on close
        }, (reason) => {
          // on dismiss
          this.handleModalDosimetriaFormClose.bind(this),
          this.handleModalDosimetriaFormClose.bind(this)
        });
      }
}

handleModalDosimetriaFormClose(response) {
  // is response an object?
  if (response === Object(response)) {
    if (response.createMode) {
      response.registro.id = response.id;
      this.registros.unshift(response.registro);
    } else {
      let index = this.registros.findIndex(value => value.Id == response.id);
      this.registros[index] = response.registro;
    }
  }
}

//funcion para exporta en hoja de calculo (todo el universo filtrado, no solo la página actual)
 exportAsXLSX():void {
    this.clearToasts();
    if (this.loading) { return; }

    let filtros = this.filtrarForm.value;
    let operador = 0;
    let periodo = 0;
    let depto = 0;
    let municipio = 0;
    let id_empleado = 0;

    if (this.user_operador !== 0) {
      operador = this.user_operador;
    } else if (filtros.Operador !== null) {
      operador = filtros.Operador.Id;
    }

    if (filtros.Periodo !== null) { periodo = filtros.Periodo.Id; }

    if (filtros.Departamento !== null) {
      depto = filtros.Departamento.Id;
      const mun = filtros.Municipio;
      municipio = (mun && typeof mun === 'object' && mun.Id) ? mun.Id : 0;
    }

    if (filtros.Identificacion_empleado !== null && filtros.Identificacion_empleado !== '') {
      id_empleado = filtros.Identificacion_empleado;
    }

    const q = (this.registroForm.get('Q') && this.registroForm.get('Q').value) || this.q || '';
    const queryParams: { [key: string]: string | number } = {
      page: 1,
      pageSize: 50000,
      export: 1,
    };
    if (q) { queryParams.q = String(q).trim(); }
    if (filtros.Ciclo !== null) { queryParams.Ciclo = filtros.Ciclo.Id; }

    this.loading = true;
    const endpoint = 'reportedosimetria/0/' + operador + '/' + periodo + '/0/' + id_empleado + '/' + depto + '/' + municipio;
    this.registroService.getWithParams(endpoint, queryParams).subscribe(res => {
      this.loading = false;
      if (res == null) {
        this.showToast('warning', 'Descarga', 'No hay datos para exportar con los filtros actuales.');
        return;
      }
      const payload: any = res;
      const data = <Array<any>>(Array.isArray(payload) ? payload : (payload.data || []));
      if (!data.length) {
        this.showToast('warning', 'Descarga', 'No hay datos para exportar con los filtros actuales.');
        return;
      }

      const excelRows = data.map(row => {
        const reported = row.Reportedosimetria || {};
        const totalMsv = reported.Total_mSv != null ? reported.Total_mSv : row.total_mSv;
        const hpAcum = reported.Hp_acumulado != null ? reported.Hp_acumulado : (row.hp_acumulado != null ? row.hp_acumulado : row.Hp_acumulado);
        return {
          Operador_Enegia: row.Operador && row.Operador.Nombreoperador,
          Periodo_Reporte: row.Periodo,
          Nit_Entidad: row.Identificacionentidad,
          Nombre_Entidad: row.Nombreentidad,
          Municipio_Entidad: !row.Municipio || row.Municipio.NombreMunicipio == 'Todos' ? 'NR' : row.Municipio.NombreMunicipio,
          Codigo_Municipio: !row.Municipio || row.Municipio.Codigo == 'Todos' ? 'NR' : row.Municipio.Codigo,
          Codigo_Departamento: row.Departamento ? row.Departamento.Codigo : 'NR',
          Direccion_Entidad: row.Direccionentidad,
          Correo_Entidad: row.Correoentidad,
          Documento_Trabajador: row.Identificacionempleado,
          Nombres_Trabajador: row.Nombreempleado,
          Apellidos_Trabajador: row.Apellidoempleado,
          Fecha_nacimiento_Trabajador: row.fecha_nacimiento || row.Fecha_nacimiento,
          Genero_Trabajador: row.Datosempleado && row.Datosempleado.Genero_empleado
            ? row.Datosempleado.Genero_empleado.Nombre
            : row.Genero_empleado,
          Nivel_educacion_Trabajador: row.Datosempleado && row.Datosempleado.Nivel_educacion
            ? (row.Datosempleado.Nivel_educacion.Nombre == 'No reporta' ? 'NR' : row.Datosempleado.Nivel_educacion.Nombre)
            : (row.Nivel_educacion == 'No reporta' ? 'NR' : row.Nivel_educacion),
          Titulo_Trabajador: row.Datosempleado ? row.Datosempleado.Titulo : row.Titulo,
          Fecha_inicio_exposicion_Trabajador: row.fecha_inicio_exposicion || row.Fecha_inicio_exposicion_empleado,
          Fecha_fin_exposicion_Trabajador: row.fecha_fin_exposicion || row.Fecha_fin_exposicion_empleado,
          Frecuencia_medicion: row.FrecuenciaMedicion == 'No reporta' ? 'NR' : (row.FrecuenciaMedicion || reported.Frecuencia_medicion && reported.Frecuencia_medicion.Nombre),
          Modifica_frecuencia_medicion: row.frecuencia_cambio || row.Frecuencia_cambio,
          Practica_RI: row.PracticaRI || row.Practica_ri,
          Tipo_dosimetro: row.TipoDosimetro || row.Tipo_dosimetro,
          Tecnologia_dosimetro: row.TecnologiaDosimetro || row.Tecnologia_dosimetro,
          Hp_mSv_Enero: this.utilidadesService.formatDosisMes(reported.Hp_mSv_Enero),
          Hp_mSv_Febrero: this.utilidadesService.formatDosisMes(reported.Hp_mSv_Febrero),
          Hp_mSv_Marzo: this.utilidadesService.formatDosisMes(reported.Hp_mSv_Marzo),
          Hp_mSv_Abril: this.utilidadesService.formatDosisMes(reported.Hp_mSv_Abril),
          Hp_mSv_Mayo: this.utilidadesService.formatDosisMes(reported.Hp_mSv_Mayo),
          Hp_mSv_Junio: this.utilidadesService.formatDosisMes(reported.Hp_mSv_Junio),
          Hp_mSv_Julio: this.utilidadesService.formatDosisMes(reported.Hp_mSv_Julio),
          Hp_mSv_Agosto: this.utilidadesService.formatDosisMes(reported.Hp_mSv_Agosto),
          Hp_mSv_Septiembre: this.utilidadesService.formatDosisMes(reported.Hp_mSv_Septiembre),
          Hp_mSv_Octubre: this.utilidadesService.formatDosisMes(reported.Hp_mSv_Octubre),
          Hp_mSv_Noviembre: this.utilidadesService.formatDosisMes(reported.Hp_mSv_Noviembre),
          Hp_mSv_Diciembre: this.utilidadesService.formatDosisMes(reported.Hp_mSv_Diciembre),
          Total_mSv: this.utilidadesService.formatNumber(totalMsv),
          Hp_Acumulado: this.utilidadesService.formatNumber(hpAcum),
          Observaciones_dosis_de_notificacion: row.Intervencion_Observacion || row.observaciones_dosis,
          Observaciones_generales: row.Investigacion_Observacion || row.observaciones_generales,
        };
      });

      this.excel = excelRows;
      this.excelService.exportAsExcelFile(excelRows, 'Dosimetria_Avanzados');
    }, () => {
      this.loading = false;
      this.showToast('error', 'Descarga', 'No se pudo generar el resumen con los filtros actuales.');
    });
 }

onEdit(event): void {
  
  const modal = this.modalService.open(DosimetriaFormComponent,{windowClass:"my-class"});
  modal.result.then((data) => {
    this.loadData(); // on close
  }, (reason) => {
    // on dismiss
    this.handleModalDosimetriaFormClose.bind(this),
    this.handleModalDosimetriaFormClose.bind(this)
  });
  modal.componentInstance.createMode = false;
  modal.componentInstance.registro_id = event.data.Id;

}

onDelete(event): void {
    //console.info(event);
    const {Id,  Periodo, Nombreentidad, Nombreempleado, Apellidoempleado } = event.data;
    const opt: any = {
      title: 'Gestión reporte dosimetría',
      text: `Seguro que desea borrar el registro del reporte del periodo ${Periodo} de la entidad ${Nombreentidad} y el empleado ${Nombreempleado} ${Apellidoempleado}  ? `,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6f8ec7',//'#DD6B55',
      confirmButtonText: 'Si, borrar!',
      cancelButtonText: "No, cancelar!",
      //buttons: true,
      //dangerMode: true,
    };
    Swal(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          const borra={"Id":Id};
          
          this.registroService.delRegistro('reportedosimetria', borra).subscribe(res => {
              if (res !== null) {
                this.loadData();
                this.showToast('info', 'Gestión reporte dosimetría', 'Reporte borrado exitosamente');
              }
              else
              {
                this.loadData();
                this.showToast('error', 'Gestión reporte dosimetría', 'No fue posible borrar el reporte');
              }
            });
        }
      });
  }

  itemselec(event): void {
    // console.log("afssaf");
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

  private clearToasts() {
    this.toasterService.clear();
  }

}
