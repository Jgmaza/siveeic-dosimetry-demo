import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

//import { NbAuthJWTToken, NbAuthService } from '@nebular/auth';  //componente auth desde nebular
import { NbAuthJWTToken, NbAuthService } from './../../@theme/components/auth'; // componente logueo adaptado aplicacion

import { combineLatest } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

const path = environment.USUARIOS_SERVICE;

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private eventFilter = new BehaviorSubject({});
  eventFilter$ = this.eventFilter.asObservable();

  private mapsSubject = new BehaviorSubject({});
  public maps$ = this.mapsSubject.asObservable();
  private mapsJson: any = {25843: {}, 54001: {},88001: {}, 88564: {}};

  private user = 0;
  loginSubscription: any;

  constructor(private http: HttpClient, private authService: NbAuthService) {
    this.loginSubscription = this.authService
      .onTokenChange()
      .subscribe((token: NbAuthJWTToken) => {
        if (token.isValid()) {
          this.user = <any>token.getPayload().operador; // here we receive a payload from the token and assigns it to our `user` variable
          // console.info(this.user);
        } else {
          this.user = 0;
        }
      });
/*
      const sanAndresMap = this.http.get('assets/map/88001.json');
      const providenciaMap = this.http.get('assets/map/88564.json');
      const ubateMap = this.http.get('assets/map/25843.json');
      const cucutaMap = this.http.get('assets/map/54001.json');
      combineLatest(
        sanAndresMap,
        providenciaMap,
        ubateMap,
        cucutaMap,
        )
      .subscribe(([sanandres, providencia, ubate, cucuta]) => {
        this.mapsJson['88001'] = sanandres;
        this.mapsJson['88564'] = providencia;
        this.mapsJson['25843'] = ubate;
        this.mapsJson['54001'] = cucuta;
        this.mapsSubject.next(this.mapsJson);
      });
      */
  }

  aplyFilter(data: any) {
    this.eventFilter.next(data);
  }

  get(endpoint, filter = '') {
    return this.http.get(`${path}${endpoint}/${this.user}/${filter}`);
  }

}
