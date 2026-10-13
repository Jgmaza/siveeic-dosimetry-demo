import { BehaviorSubject, Observable, observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import * as moment from 'moment';
//import { NbAuthService, NbAuthJWTToken } from '@nebular/auth';  //componente auth desde nebular
import { NbAuthService, NbAuthJWTToken } from '../../../@theme/components/auth'; // componente logueo adaptado aplicacion
import { Operador } from '../models/operador/operador';
import { DEMO_OPERADORES, demoReportResponse } from './dosimetria-demo-mock';

const path = environment.REGISTROS_SERVICE;

@Injectable({
    providedIn: 'root',
})
export class DosimetriaService {
    user: any;
    loginSubscription: any;
    auth:any;
    header:any;

    private userSubject = new BehaviorSubject({});
    user$ = this.userSubject.asObservable()

    constructor(private http: HttpClient, private authService: NbAuthService) {
        this.loginSubscription = this.authService
          .onTokenChange()
          .subscribe((token: NbAuthJWTToken) => {
            if (token.isValid()) {
              //this.user = <any>token.getPayload().operador; // here we receive a payload from the token and assigns it to our `user` variable
              this.auth=token;
              const payload = token.getPayload();
              this.user= {"id":payload.id,"operador":payload.operador, "role":payload.role};
              console.log(payload);
              this.userSubject.next(this.user);
            } else {
              this.user= {"id":0,"operador":0};
              //this.user = 0;
              this.userSubject.next(this.user);
            }
          });
      }


    validatoken(){
        // Portfolio demo: never force logout; mock API has no real JWT lifecycle.
        return true;
      }
    logout() {
        // Portfolio demo: stay on reportes
        return;
      }

    head(){
            const token = (this.auth && (this.auth.token || (this.auth.getValue && this.auth.getValue()))) || 'demo-token';
            return {headers:{'Content-Type': 'application/json', 'authorization': token}};
         }

    headMulti(){
            const token = (this.auth && (this.auth.token || (this.auth.getValue && this.auth.getValue()))) || 'demo-token';
            return {headers:{'authorization': token}};
         }


    get(endpoint) {
        // Portfolio demo: serve mock locally (no backend / interceptor dependency).
        if (String(endpoint).indexOf('operador_light') >= 0) {
            return of(DEMO_OPERADORES).pipe(delay(80));
        }
        if (String(endpoint).indexOf('reportedosimetria') >= 0) {
            return of(demoReportResponse(endpoint, {})).pipe(delay(120));
        }
        let head= this.head();
        return this.http.get(path + endpoint, head);
    }
    getWithParams(endpoint, queryParams: { [key: string]: string | number | null | undefined }) {
        if (String(endpoint).indexOf('reportedosimetria') >= 0) {
            return of(demoReportResponse(endpoint, queryParams || {})).pipe(delay(120));
        }
        const head = this.head();
        let params = new HttpParams();
        Object.keys(queryParams || {}).forEach((key) => {
            const value = queryParams[key];
            if (value !== null && value !== undefined && String(value).trim() !== '') {
                params = params.set(key, String(value));
            }
        });
        return this.http.get(path + endpoint, { ...head, params });
    }
    post(endpoint, element) {
        let head= this.head();
        return this.http.post(path + endpoint, element, head);
    }
    put(endpoint, element) {
        let head= this.head();
        return this.http.put(path + endpoint + '/' + element.Id, element, head);
    }
    delete(endpoint, element) {
        let head= this.head();
        return this.http.delete(path + endpoint + '/' + element.Id, head);
    }
    getOptions(endpoint, filter = '') {
        let head= this.head();
        return this.http.get(`${path}${endpoint}/${this.user}/${filter}`, head);
    }
    putRegistro(endpoint, element) {
        const dato = {
            ...element,
            ...{ Operador: parseInt(element.Operador.Id, 10) },
            ...{ Periodo: element.Periodo.Id },
            ...{ Ciclo: parseInt(element.Ciclo.Id, 10) },
            ...{ Frecuencia_medicion: parseInt(element.Frecuancia_medicion.Id, 10) },
            ...{ Departamento: parseInt(element.Departamento.Id, 10) },
            ...{ Municipio: parseInt(element.Municipio.Id, 10) },
            ...{ Genero_empleado: parseInt(element.Genero_empleado.Id, 10) },
            ...{ Nivel_educacion: parseInt(element.Nivel_educacion.Id, 10) },
            ...{ Practica_ri: parseInt(element.Practica_ri.Id, 10) },
            ...{ Tipo_dosimetro: parseInt(element.Tipo_dosimetro.Id, 10) },

        }
        // console.info(dato);
        let head= this.head();
        return this.http.put(path + endpoint + '/' + dato.Id, dato, head);
    }
    postRegistro(endpoint: string, element: any) {
        const dato = {
            ...element,
            ...{ Operador: parseInt(element.Operador.Id, 10) },
            ...{ Periodo: element.Periodo.Id },
            ...{ Ciclo: parseInt(element.Ciclo.Id, 10) },
            ...{ Departamento: parseInt(element.Departamento.Id, 10) },
            ...{ Municipio: parseInt(element.Municipio.Id, 10) },
            ...{ Genero_empleado: parseInt(element.Genero_empleado.Id, 10) },
            ...{ Nivel_educacion: parseInt(element.Nivel_educacion.Id, 10) },
            ...{ Frecuencia_medicion: parseInt(element.Frecuencia_medicion.Id, 10) },
            ...{ Frecuencia_cambio: element.Frecuencia_cambio.Id },
            ...{ Practica_ri: parseInt(element.Practica_ri.Id, 10) },
            ...{ Tipo_dosimetro: parseInt(element.Tipo_dosimetro.Id, 10) },
            ...{ Latitud: 0 },
            ...{ Longitud: 0 },

        }
        // console.info(dato);
        let head= this.head();
        return this.http.post(path + endpoint, dato, head);
    }

    postValidacionArchivo(endpoint: string, operadorId: number, file:File, handlePartial?: (obj:any)=>void, periodo?: number) {
        const dato: any = {
            Operador: operadorId,
        };
        if (periodo != null && !Number.isNaN(periodo)) {
            dato.Periodo = periodo;
        }
        
        // se crea formData para enviar datos y archivos (solo datos no hay necesidad)
        const Fdata= new FormData();
        Object.keys(dato).forEach((key) => {
            Fdata.append(key,dato[key]);
          })
          if(file && file!==null){
            Fdata.append('File_dosimetria', file);  
          }
        
        const token = (this.auth && this.auth.token) ? this.auth.token : '';
        const headers: any = {};
        if (token) headers['authorization'] = token;

        const url = path + endpoint;

        return new Promise(async (resolve, reject) => {
            try {
                const resp = await fetch(url, { method: 'POST', body: Fdata, headers });
                if (!resp.ok) {
                    const txt = await resp.text().catch(()=>null);
                    return reject(new Error(`HTTP ${resp.status} ${resp.statusText} ${txt || ''}`));
                }

                // Si no hay body (no streaming), parsear JSON completo
                if (!resp.body) {
                    const full = await resp.json().catch(()=>null);
                    if (handlePartial && full) handlePartial(full);
                    return resolve(full);
                }

                const reader = resp.body.getReader();
                const decoder = new TextDecoder();
                let buf = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buf += decoder.decode(value, { stream: true });

                    const parts = buf.split(/\r?\n/);
                    buf = parts.pop() || '';

                    for (const line of parts) {
                        const s = line.trim();
                        if (!s) continue;
                        try {
                            const obj = JSON.parse(s);
                            if (typeof handlePartial === 'function') {
                                handlePartial(obj);
                            }
                        } catch (ex) {
                            console.warn('postValidacionArchivo: invalid chunk', s);
                        }
                    }
                }

                if (buf.trim()) {
                    try {
                        const last = JSON.parse(buf);
                        if (typeof handlePartial === 'function') handlePartial(last);
                        return resolve(last);
                    } catch (ex) {
                        return resolve(buf);
                    }
                }

                return resolve(null);
            } catch (error) {
                return reject(error);
            }
        });        
     
    }

    downloadErrorFile(endpoint: string, fileUrl: string): Promise<Blob> {
        const token = (this.auth && this.auth.token) ? this.auth.token : '';
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        // path ya termina en '/' (REGISTROS_SERVICE); no anteponer otro slash
        const url = path + endpoint + '/' + encodeURIComponent(fileUrl);
        return fetch(url, { method: 'GET', headers })
            .then(resp => {
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                    return resp.blob();
            });
    }

    postRegistroMasivo(endpoint: string, element: any, file:File) {
        const operadorId = element.Operador != null && typeof element.Operador === 'object'
            ? parseInt(element.Operador.Id, 10)
            : parseInt(element.Operador, 10);
        const dato: any = {
            ...element,
            Operador: operadorId,
        };
        if (element.Periodo != null) {
            dato.Periodo = typeof element.Periodo === 'object' ? element.Periodo.Id : element.Periodo;
        }
        // Carga masiva: ciclo anual por defecto (Id 68) si no viene en el formulario
        if (element.Ciclo != null && typeof element.Ciclo === 'object') {
            dato.Ciclo = parseInt(element.Ciclo.Id, 10);
        } else if (element.Ciclo != null && element.Ciclo !== '' && String(element.Ciclo) !== 'null') {
            dato.Ciclo = parseInt(element.Ciclo, 10);
        } else {
            dato.Ciclo = 68;
        }
        const Fdata= new FormData();
        Object.keys(dato).forEach((key) => {
            const value = dato[key];
            if (value === null || value === undefined || value === '' || String(value) === 'null' || Number.isNaN(value)) {
              return;
            }
            if (typeof value === 'object') {
              return;
            }
            Fdata.append(key, value);
          })
          if(file && file!==null){
            Fdata.append('File_dosimetria', file);  
          }
        let head= this.headMulti();
        return this.http.post(path + endpoint, Fdata, head);
    }


    postRegistroCsv(endpoint: string, element: any) {
        const dato = {
            ...element,
            ...{ Operador: parseInt(element.Operador.Id, 10) },
            ...{ Periodo: element.Periodo.Id },
            ...{ Ciclo: parseInt(element.Ciclo.Id, 10) },
            ...{ Latitud: 0 },
            ...{ Longitud: 0 },
        }
        // console.info(dato);
        let head= this.head();
        return this.http.post(path + endpoint, dato, head);
    }    

    delRegistro(endpoint, element) {
        const dato = {
            ...element,
        }
        let head= this.head();
        return this.http.delete(path + endpoint + '/' + dato.Id, head);
    }


}
