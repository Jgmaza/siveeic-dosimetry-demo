// ==============================================================================
// PROYECTO: SIVEEIC
// MODIFICADO POR: Johan Piñeres
// CONTACTO: johanpineres@gmail.com
// CELULAR: 3003241133
// FECHA: 2026-08-11
// DESCRIPCIÓN: Componente de cabecera principal de la aplicación SIVEEIC
//
// HISTORIAL DE CAMBIOS:
// - 2026-08-11 - MODIFICACIÓN: Redirección al clic del logo según el rol del usuario (Rol 12 VUCE -> load-mincit) - Johan Piñeres
// ==============================================================================
import { Component, Input, OnInit } from '@angular/core';
import { NbMenuService, NbSidebarService } from '@nebular/theme';
import { AnalyticsService } from '../../../@core/utils/analytics.service';
// import { AutenticationService } from '../../../@core/utils/autentication.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
//import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';  //componente auth desde nebular
import { NbAuthJWTToken, NbAuthService } from './../../../@theme/components/auth'; // componente logueo adaptado aplicacion

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent {

  @Input() position = 'normal';
  itemClick: Subscription;
  liveTokenValue: boolean = false;
  user: any;
  title: any;
  username = '';
  userMenu = [{ title: 'ver todas', icon: 'fa fa-list' }];
  public noNotify: any = '0';
  loginSubscription: Subscription;

  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private analyticsService: AnalyticsService,
    private router: Router,
    private authService: NbAuthService,
    public translate: TranslateService) {
      this.loginSubscription = this.authService.onTokenChange()
      .subscribe((token: NbAuthJWTToken) => {
        if ( token.isValid() ) {
          this.user = token.getPayload(); // here we receive a payload from the token and assigns it to our `user` variable
          this.username = this.user.usuario;
          // console.info(this.user);
        } else {
          this.inicio();
        }

      });
    this.translate = translate;
    this.itemClick = this.menuService.onItemClick()
      .subscribe((event) => {
        this.onContecxtItemSelection(event.item.title);
      });

  }

  useLanguage(language: string) {
    this.translate.use(language);
  }



  onContecxtItemSelection(title) {
    if (title === 'ver todas') {
      this.router.navigate(['/pages/notificacion/listado']);
    }
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(false, 'menu-sidebar');
    return false;
  }

  goToHome() {
    this.router.navigate(['/pages/dosimetria/reportes-dosimetria']);
  }

  logout() {
    this.router.navigate(['/pages/dosimetria/reportes-dosimetria']);
  }

  inicio() {
    this.router.navigate(['/pages/dosimetria/reportes-dosimetria']);
  }

  startSearch() {
    this.analyticsService.trackEvent('startSearch');
  }
}
