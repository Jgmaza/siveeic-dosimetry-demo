import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';

import { ParamMap, Router, ActivatedRoute } from '@angular/router';
import { TipoEstado } from './../../../../@core/data/models/tipo_estado';
import { RecuperarService } from '../../../../@core/data/services/recuperarcuenta.service';


@Component({
  selector: 'solicitar-form',
  templateUrl: './solicitar.component.html',
  styleUrls: ['./solicitar.component.scss'],
})
export class NbSolicitarComponent implements OnInit {
  config: ToasterConfig;
  uid: number;
  user: any ;
  estado: any;
  Estadousuario = [];
  passForm: FormGroup;

  constructor(private translate: TranslateService,
      private formBuilder: FormBuilder,
      private registroService: RecuperarService,
      private toasterService: ToasterService,
      private route: ActivatedRoute
  ) {
      this.construirForm();
    }

 construirForm() {
    this.passForm = this.formBuilder.group({
                    Nombre: ['',  Validators.compose([  ]) ],
                    Usuario: ['',  Validators.compose([ Validators.required,Validators.minLength(4)]) ],
                  }
    );
}

  ngOnInit() {
   // this.load_UserData();
  }

  load_UserData(): void {
    
  }  

  saveRegistro() {

      if (this.passForm.invalid) {
        return;
      }
      let registro = this.passForm.value;
      var str = document.location.href; 
      let url= str.split("#", 1); 
      registro.Host=url[0];

      //se guarda el reporte
      this.registroService.postRegistro('solicitud',registro)
      .subscribe(res => {
        let resultado = <any>res;
        //VERIFICA SI SE REGISTRO EL operador;
        if(resultado && resultado.error )
          {
            //this.showToast('error', 'Gestión Datos Cuenta!', 'No fue posible cambiar la contraseña, intente de nuevo');
              const opt: any = {
                title: 'Gestión Datos Cuenta',
                text: 'No fue posible realizar su solicitud debido a que '+resultado.error+', intente de nuevo o comuniquese con el administrador',
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
                text: 'Se ha enviado el enlace para recuperar su contraseña al correo: '+resultado.mail,
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
