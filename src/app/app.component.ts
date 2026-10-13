// ==============================================================================
// PROYECTO: SIVEEIC
// AUTOR: Akveo / Jairo Lavado
// MODIFICADO POR: Johan Piñeres
// CONTACTO: johanpineres@gmail.com
// CELULAR: 3003241133
// FECHA: 2026-08-28
// DESCRIPCIÓN: Componente principal de la app con listener de versión y comprobación QA/Prod
//
// HISTORIAL DE CAMBIOS:
// - 2026-08-25 - MODIFICACIÓN: Inclusión de banner de versión en consola y atajo secreto Ctrl+Shift+V - Johan Piñeres
// - 2026-08-28 - MODIFICACIÓN: Actualización de versión desplegada para HU-016 Catálogos VUCE - Johan Piñeres
// ==============================================================================
import { Component, OnInit, HostListener } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {
  private frontendVersion = 'release-HU-016-catalogos-vuce-20260828';
  private backendVersionInfo: any = null;

  constructor(
    private analytics: AnalyticsService,
    private translateService: TranslateService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.translateService.addLangs(['es', 'en']);
    this.translateService.setDefaultLang('es');
    this.translateService.use(this.translateService.getBrowserLang());

    // [2026-08-25] ADD: Comprobación automática de versión Backend/Frontend en consola - Johan Piñeres
    this.checkVersion();
  }

  // [2026-08-25] ADD: Atajo de teclado Ctrl + Shift + V para mostrar modal de versión - Johan Piñeres
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.shiftKey && (event.key === 'V' || event.key === 'v')) {
      event.preventDefault();
      this.showVersionModal();
    }
  }

  private checkVersion() {
    this.http.get('/api/version').subscribe(
      (res: any) => {
        this.backendVersionInfo = res;
        console.log(
          '%c============================================================\n' +
          '%c SIVEEIC INFRASTRUCTURE BUILD INFO\n' +
          `   FRONTEND VERSION : ${this.frontendVersion}\n` +
          `   BACKEND VERSION  : ${res.back_version || 'Desconocido'}\n` +
          `   RELEASE HUs      : ${(res.hus_included || []).join(', ')}\n` +
          `   TIMESTAMP        : ${res.timestamp || new Date().toISOString()}\n` +
          '%c============================================================',
          'color: #007bff; font-weight: bold;',
          'color: #28a745; font-size: 14px; font-weight: bold;',
          'color: #007bff; font-weight: bold;'
        );
      },
      (err) => {
        console.warn('[SIVEEIC BUILD INFO] Frontend ver:', this.frontendVersion, '| Error consultando /api/version:', err.message);
      }
    );
  }

  private showVersionModal() {
    const backVer = this.backendVersionInfo ? this.backendVersionInfo.back_version : 'No disponible';
    const hus = this.backendVersionInfo ? (this.backendVersionInfo.hus_included || []).join(', ') : 'HU-005, HU-008, HU-009';
    const envName = (this.backendVersionInfo && this.backendVersionInfo.env) ? this.backendVersionInfo.env : 'QA';

    const opt: any = {
      title: 'SIVEEIC - Versión Desplegada',
      type: 'info',
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6;">
          <p><b>Frontend Version:</b> <span style="color:#007bff;">${this.frontendVersion}</span></p>
          <p><b>Backend Version:</b> <span style="color:#28a745;">${backVer}</span></p>
          <p><b>Historias de Usuario:</b> ${hus}</p>
          <p><b>Entorno:</b> ${envName}</p>
          <p><b>Timestamp:</b> ${new Date().toLocaleString()}</p>
        </div>
      `,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#0275d8'
    };
    Swal(opt);
  }
}

