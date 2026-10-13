import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

import { UsuariosService } from '../../../@core/data/usuarios.service';
import { validarQueSeanIguales } from './pass.validar';

@Component({
  selector: 'app-pass-form',
  templateUrl: './pass-form.component.html',
  styleUrls: ['./pass-form.component.scss']
})
export class PassFormComponent implements OnInit {
  config: ToasterConfig;
  uid: number;
  passForm: FormGroup;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      private registroService: UsuariosService,
      private toasterService: ToasterService
  ) {
  this.load_UserData();
  this.construirForm();
 }

 construirForm() {
  this.passForm = this.formBuilder.group({
                  passActual: ['',  Validators.compose([ Validators.required,Validators.minLength(7),Validators.maxLength(20) ]) ],
                  passNuevo: ['',  Validators.compose([ Validators.required,Validators.minLength(1),Validators.maxLength(20), Validators.pattern(/^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{6,30}$/)]) ],
                  passReiterar: ['',  Validators.compose([ Validators.required,Validators.minLength(7),Validators.maxLength(20), Validators.pattern(/^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{6,30}$/)]) ],
                },
                {
                  validators: validarQueSeanIguales
                }
  );
}

  ngOnInit() {

  }

  load_UserData(): void {
    // rescata el idoperador asociado al usuario
    this.registroService.user$
    .subscribe((user: any) => {
        this.uid = user.id;
    });
  }  

  saveRegistro() {

      if (this.passForm.invalid) {
        return;
      }

      let registro = this.passForm.value;
      let data = {"Id":this.uid,"Registro":registro.passActual};

      const opt: any = {
        title: 'Gestión Datos Cuenta',
        text: 'Seguro de cambiar la contraseña?',
        // 'success' | 'error' | 'warning' | 'info' | 'question'
        type: 'question',
        showCancelButton: true,
        confirmButtonColor: '#6f8ec7',//'#DD6B55',
        confirmButtonText: 'Si, Guardar!',
        cancelButtonText: "No, cancelar!",
        //buttons: true,
        //dangerMode: true,
        //showCancelButton: true,
      };
      Swal(opt)
        .then((willDelete) => {
          if (willDelete.value) {
            //verifica si el reporte ya existe
            this.registroService.postValidar('validar',data)
            .subscribe(res => {
              let verificado = <any>res;
              if (verificado && verificado.error) {
                  //this.eventChange.emit(true);
                  //this.showToast('error', 'Gestión Datos Cuenta!', 'Contraseña actual no corresponde.<br>Verifique los datos e intente de nuevo');
                    const opt: any = {
                      title: 'Contraseña no valida!',
                      text: 'Contraseña actual no corresponde. Verifique los datos e intente de nuevo',
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
                            text: 'Contraseña actualizada exitosamente',
                            // 'success' | 'error' | 'warning' | 'info' | 'question'
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonColor: '#6f8ec7',//'#DD6B55',
                            confirmButtonText: 'Aceptar',
                            //cancelButtonText: "No, cancelar!",
                          };
                          Swal(opt)
                            .then((willDelete) => {
                            });

                      }
                  });
                }
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
    //console.log(cambio);
    alert("fucnion");

   // var tipo = this.passForm.get("passNuevo");
    //console.log(tipo);
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
