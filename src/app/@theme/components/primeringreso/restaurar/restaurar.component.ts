import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';


import { ParamMap, Router, ActivatedRoute } from '@angular/router';
import { TipoEstado } from './../../../../@core/data/models/tipo_estado';
import { RecuperarService } from '../../../../@core/data/services/recuperarcuenta.service';
import { validarQueSeanIguales } from './pass.validar';


@Component({
  selector: 'restaurar-form',
  templateUrl: './restaurar.component.html',
  styleUrls: ['./restaurar.component.scss'],
})
export class NbRestaurarComponent implements OnInit {
  config: ToasterConfig;
  uid: number;
  user: any ;
  fini: any ;
  ffin: any ;
  estado: any;
  hoy: number = Date.now();
  Estadousuario = [];
  passForm: FormGroup;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      private registroService: RecuperarService,
      private toasterService: ToasterService,
      private route: ActivatedRoute
  ) {
      this.load_UserData();
      this.construirForm();
      this.loadOptionsEstadousuario();
    }

 construirForm() {
    this.passForm = this.formBuilder.group({
                    Nombre: ['',  Validators.compose([  ]) ],
                    Usuario: ['',  Validators.compose([  ]) ],
                  //  Estadousuario: ['',  Validators.compose([  ]) ],
                    passNuevo: ['',  Validators.compose([ Validators.required,Validators.minLength(7),Validators.maxLength(20), Validators.pattern(/^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{6,30}$/)]) ],
                    passReiterar: ['',  Validators.compose([ Validators.required,Validators.minLength(7),Validators.maxLength(20), Validators.pattern(/^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{6,30}$/)]) ],
                  },
                  {
                    validators: validarQueSeanIguales
                  }
    );
}

  ngOnInit() {
   // this.load_UserData();
  }

  load_UserData(): void {
    let token=JSON.stringify(this.route.snapshot.queryParamMap);
    let aux = JSON.parse(token);
    let param = JSON.parse(atob(aux.params.g3nc4n));
    this.user=param.u53r;
    
    this.fini=new Date(this.hoy).toISOString().split('T')[0];
    this.ffin=new Date(param.f3ch4).toISOString().split('T')[0];

   
    this.registroService.get('resumen_usuario/'+param.u53r+'/'+param.u1d).subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;


        if(this.fini<=this.ffin)
          {
          this.passForm.patchValue(data[0]);  
          }

        let datos=JSON.parse(JSON.stringify(data));
        this.uid=datos[0].Id;
        this.estado=datos[0].Estadousuario;

        this.Permisos();
      }
    });
  }  

  Permisos()
  {  
    this.passForm.get('Nombre').disable();
    this.passForm.get('Usuario').disable();
   // this.passForm.get('Estadousuario').disable();



    if(this.fini>this.ffin)
        {this.passForm.get('passNuevo').disable();
          //this.passForm.get('passReiterar').disable();
          this.passForm.hasError('vencido');
          this.mensaje('vencido')
        }/*
    else if(this.estado.NombreEstado!=='Registrado')
        {this.passForm.get('passNuevo').disable();
          //this.passForm.get('passReiterar').disable();
          this.passForm.hasError('usado');
          this.mensaje('usado')
          }*/
     
  }  

  compareById(o1,o2){
    if(o1 == null || o2 == null){
      return false;
    }
    return o1.Id === o2.Id;
  }

  loadOptionsEstadousuario(): void {
    let estadousuario: any=TipoEstado;
    this.registroService.get('tipo_estado')
      .subscribe(res => {
        if (res !== null) {
          this.Estadousuario = <Array<TipoEstado>>res;
        }
      });
  }

  mensaje(tipo)
    { let mensaje='';
      if(tipo==='usado')
         { mensaje = 'Este enlace ya ha sido usado!'}
      if(tipo==='vencido')
         { mensaje = 'Este enlace ha expirado, solicite uno nuevo!'}
      
      const opt: any = {
          title: 'Enlace Inválido',
          text: mensaje,
          // 'success' | 'error' | 'warning' | 'info' | 'question'
          type: 'warning',
          showCancelButton: false,
          confirmButtonColor: '#6f8ec7',//'#DD6B55',
          confirmButtonText: 'Aceptar',
          //cancelButtonText: "No, cancelar!",
        };
        Swal(opt)
          .then((willDelete) => {
          });
    }

  saveRegistro() {

      if (this.passForm.invalid) {
        return;
      }

      let registro = this.passForm.value;
      let data = {"Id":this.uid,"Registro":registro.passActual};

      //se guarda el reporte
      this.registroService.restaurarPassword(this.uid,{ Nroidentificacion : registro.passNuevo})
      .subscribe(res => {
        let resultado = <any>res;
        //VERIFICA SI SE REGISTRO EL operador;
        if(resultado && resultado.error )
          {
            //this.showToast('error', 'Gestión Datos Cuenta!', 'No fue posible cambiar la contraseña, intente de nuevo');
              const opt: any = {
                title: 'Gestión Datos Cuenta',
                text: 'No fue posible cambiar la contraseña, intente de nuevo',
                // 'success' | 'error' | 'warning' | 'info' | 'question'
                type: 'warning',
                showCancelButton: false,
                confirmButtonColor: '#6f8ec7',//'#DD6B55',
                confirmButtonText: 'Aceptar',
                //cancelButtonText: "No, cancelar!",
              };
              Swal(opt)
                .then((willDelete) => {
                });
           
          }
        else
          { 
           // this.showToast('info', 'Gestión Datos Cuenta', 'Contraseña actualizada exitosamente');
              const opt: any = {
                title: 'Gestión Datos Cuenta',
                text: 'Contraseña asignada exitosamente',
                // 'success' | 'error' | 'warning' | 'info' | 'question'
                type: 'success',
                showCancelButton: false,
                confirmButtonColor: '#6f8ec7',//'#DD6B55',
                confirmButtonText: 'Aceptar',
                //cancelButtonText: "No, cancelar!",
              };
              Swal(opt)
                .then((willDelete) => {
                  window.location.href = '#';
                });
          }
      });
  }

  checarSiSonIguales(): boolean {
    return this.passForm.hasError('noSonIguales') &&
    this.passForm.get('passNuevo').dirty &&
    this.passForm.get('passReiterar').dirty;
  }

  mostrarPassword(){
    //var cambio = document.getElementById("passNuevo");
    //console.info(cambio);
    alert("fucnion");

    //var tipo = this.passForm.get("passNuevo");
    //console.info(tipo);
    //this.passForm.get('Departamento').value
    /*
    if(cambio.type == "password"){
			cambio.type = "text";
			$('.icon').removeClass('fa fa-eye-slash').addClass('fa fa-eye');
		}else{
			cambio.type = "password";
			$('.icon').removeClass('fa fa-eye').addClass('fa fa-eye-slash');
		}*/
	} 
  
/*  
	$(document).ready(function () {
	//CheckBox mostrar contraseña
	$('#ShowPassword').click(function () {
		$('#Password').attr('type', $(this).is(':checked') ? 'text' : 'password');
	});
});
*/
 

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
