import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpResponse,
  HttpEvent,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DEMO_OPERADORES, demoReportResponse } from '../data/services/dosimetria-demo-mock';

/** Intercepts /api so the static demo needs no backend. */
@Injectable()
export class DemoMockInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const url = req.url || '';
    const isApi =
      url.indexOf('/api/') >= 0
      || url.indexOf('localhost:3010') >= 0
      || url.indexOf('localhost:3011') >= 0
      || url.indexOf('minenergia.gov.co') >= 0;

    if (!isApi) {
      return next.handle(req);
    }

    const path = url.replace(/^https?:\/\/[^/]+/, '').split('?')[0];
    const body = this.resolve(path, req);
    return of(new HttpResponse({ status: 200, body })).pipe(delay(120));
  }

  private resolve(path: string, req: HttpRequest<any>): any {
    if (path.indexOf('/api/version') >= 0) {
      return {
        back_version: 'demo-mock',
        hus_included: ['reportes-dosimetria'],
        env: 'demo',
        timestamp: new Date().toISOString(),
      };
    }

    if (path.indexOf('operador_light') >= 0) {
      return DEMO_OPERADORES;
    }

    if (path.indexOf('permisos/') >= 0) {
      return null;
    }

    if (path.indexOf('reportedosimetria') >= 0) {
      const queryParams: { [key: string]: string | number } = {};
      req.params.keys().forEach((key) => {
        queryParams[key] = req.params.get(key);
      });
      const endpoint = path.split('/api/').pop() || path;
      return demoReportResponse(endpoint, queryParams);
    }

    if (path.indexOf('reportehistoricodosimetria') >= 0) {
      return { ok: true, message: 'Demo export simulated' };
    }

    if (req.method === 'GET') {
      return [];
    }
    return { ok: true };
  }
}
