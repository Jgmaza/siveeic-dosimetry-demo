// ==============================================================================
// PROYECTO: SIVEEIC
// AUTOR: Johan Piñeres
// CONTACTO: johanpineres@gmail.com
// CELULAR: 3003241133
// FECHA: 2026-08-31
// DESCRIPCIÓN: Servicio Angular para consumo de API de administración de Catálogos VUCE (HU-016)
//
// HISTORIAL DE CAMBIOS:
// - 2026-08-27 - CREACIÓN DEL ARCHIVO - Métodos HTTP para Radionúclidos y Tipos de Fuente (HU-016 Fase 1) - Johan Piñeres
// - 2026-08-27 - MODIFICACIÓN: Métodos HTTP para Modelos o Referencias (HU-016 Fase 2) - Johan Piñeres
// - 2026-08-28 - MODIFICACIÓN: Métodos HTTP para Fabricantes (HU-016 Fase 3) - Johan Piñeres
// - 2026-08-31 - MODIFICACIÓN: Métodos HTTP para Países de Compra y Origen (HU-016 Fase 4) - Johan Piñeres
// ==============================================================================
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NbAuthService, NbAuthJWTToken } from '../../../@theme/components/auth';

const path = environment.REGISTROS_SERVICE;

export interface RadionuclidoItem {
  id?: number;
  descripcion: string;
  id_tipo_fuente: number;
  tipo_fuente?: string;
}

export interface ModeloReferenciaItem {
  id?: number;
  descripcion: string;
}

export interface FabricanteItem {
  id?: number;
  descripcion: string;
}

export interface PaisItem {
  id?: string;
  id_var?: string;
  nombre?: string;
  nombre_var?: string;
  tipo?: string;
  tipo_var?: string;
  descripcion?: string;
  desc_var?: string;
  estado?: number;
  id_estado_var?: number;
  estado_desc?: string;
}

export interface TipoFuenteItem {
  id: number;
  descripcion: string;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogosVuceService {
  private tokenValue: string = '';

  constructor(private http: HttpClient, private authService: NbAuthService) {
    this.authService.onTokenChange().subscribe((token: NbAuthJWTToken) => {
      if (token.isValid()) {
        this.tokenValue = token.getValue();
      }
    });
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    if (this.tokenValue) {
      headers = headers.set('Authorization', 'Bearer ' + this.tokenValue);
    }
    return headers;
  }

  // ==========================================================================
  // TIPOS DE FUENTE (Catálogo de apoyo)
  // ==========================================================================
  getTiposFuente(): Observable<any> {
    const url = `${path}catalogos/tipo_fuente`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  // ==========================================================================
  // RADIONÚCLIDOS (CRUD HU-016 Fase 1)
  // ==========================================================================
  getRadionuclidos(params?: { search?: string; id_tipo_fuente?: number }): Observable<any> {
    const url = `${path}radionuclidos`;
    let httpParams = new HttpParams();
    if (params) {
      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }
      if (params.id_tipo_fuente) {
        httpParams = httpParams.set('id_tipo_fuente', params.id_tipo_fuente.toString());
      }
    }
    return this.http.get<any>(url, { headers: this.getHeaders(), params: httpParams });
  }

  getRadionuclidoById(id: number): Observable<any> {
    const url = `${path}radionuclidos/${id}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  createRadionuclido(data: RadionuclidoItem): Observable<any> {
    const url = `${path}radionuclidos`;
    return this.http.post<any>(url, data, { headers: this.getHeaders() });
  }

  updateRadionuclido(id: number, data: RadionuclidoItem): Observable<any> {
    const url = `${path}radionuclidos/${id}`;
    return this.http.put<any>(url, data, { headers: this.getHeaders() });
  }

  deleteRadionuclido(id: number): Observable<any> {
    const url = `${path}radionuclidos/${id}`;
    return this.http.delete<any>(url, { headers: this.getHeaders() });
  }

  // ==========================================================================
  // MODELOS O REFERENCIAS (CRUD HU-016 Fase 2)
  // ==========================================================================
  getModelosReferencia(params?: { search?: string }): Observable<any> {
    const url = `${path}modelos-referencia`;
    let httpParams = new HttpParams();
    if (params && params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<any>(url, { headers: this.getHeaders(), params: httpParams });
  }

  getModeloReferenciaById(id: number): Observable<any> {
    const url = `${path}modelos-referencia/${id}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  createModeloReferencia(data: ModeloReferenciaItem): Observable<any> {
    const url = `${path}modelos-referencia`;
    return this.http.post<any>(url, data, { headers: this.getHeaders() });
  }

  updateModeloReferencia(id: number, data: ModeloReferenciaItem): Observable<any> {
    const url = `${path}modelos-referencia/${id}`;
    return this.http.put<any>(url, data, { headers: this.getHeaders() });
  }

  deleteModeloReferencia(id: number): Observable<any> {
    const url = `${path}modelos-referencia/${id}`;
    return this.http.delete<any>(url, { headers: this.getHeaders() });
  }

  // ==========================================================================
  // FABRICANTES (CRUD HU-016 Fase 3)
  // ==========================================================================
  getFabricantes(params?: { search?: string }): Observable<any> {
    const url = `${path}fabricantes`;
    let httpParams = new HttpParams();
    if (params && params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<any>(url, { headers: this.getHeaders(), params: httpParams });
  }

  getFabricanteById(id: number): Observable<any> {
    const url = `${path}fabricantes/${id}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  createFabricante(data: FabricanteItem): Observable<any> {
    const url = `${path}fabricantes`;
    return this.http.post<any>(url, data, { headers: this.getHeaders() });
  }

  updateFabricante(id: number, data: FabricanteItem): Observable<any> {
    const url = `${path}fabricantes/${id}`;
    return this.http.put<any>(url, data, { headers: this.getHeaders() });
  }

  deleteFabricante(id: number): Observable<any> {
    const url = `${path}fabricantes/${id}`;
    return this.http.delete<any>(url, { headers: this.getHeaders() });
  }

  // ==========================================================================
  // PAÍSES (CRUD HU-016 Fase 4 - PaisCompra y PaisOrigen)
  // ==========================================================================
  // [2026-08-31] ADD: Métodos CRUD Países - Johan Piñeres
  getPaises(params?: { search?: string; estado?: number }): Observable<any> {
    const url = `${path}paises`;
    let httpParams = new HttpParams();
    if (params) {
      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }
      if (params.estado !== undefined && params.estado !== null) {
        httpParams = httpParams.set('estado', params.estado.toString());
      }
    }
    return this.http.get<any>(url, { headers: this.getHeaders(), params: httpParams });
  }

  getPaisById(id: string): Observable<any> {
    const url = `${path}paises/${id}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  createPais(data: PaisItem): Observable<any> {
    const url = `${path}paises`;
    return this.http.post<any>(url, data, { headers: this.getHeaders() });
  }

  updatePais(id: string, data: PaisItem): Observable<any> {
    const url = `${path}paises/${id}`;
    return this.http.put<any>(url, data, { headers: this.getHeaders() });
  }

  deletePais(id: string): Observable<any> {
    const url = `${path}paises/${id}`;
    return this.http.delete<any>(url, { headers: this.getHeaders() });
  }
}



