import { BehaviorSubject, Observable, observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../../../environments/environment';
import * as moment from 'moment';
//import { NbAuthService, NbAuthJWTToken } from '@nebular/auth';  //componente auth desde nebular
import { NbAuthService, NbAuthJWTToken } from './../../../@theme/components/auth'; // componente logueo adaptado aplicacion


const path = environment.REGISTROS_SERVICE;

@Injectable({
    providedIn: 'root',
})
export class PerfilService {
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
              this.user= {"id":token.getPayload().id,"operador":token.getPayload().operador};
              this.userSubject.next(this.user);
            } else {
              this.user= {"id":0,"operador":0};
              //this.user = 0;
              this.userSubject.next(this.user);
            }
          });
      }

    head(){
        let header= {headers:{'Content-Type': 'application/json', 'authorization':this.auth.token}} 
        return header
     }

    get(endpoint) {
        let head= this.head();
        return this.http.get(path + endpoint, head);
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
            ...{ Rol: parseInt(element.Rol.Id, 10) },
            ...{ Enlace: parseInt(element.Enlace.Id, 10) },
            ...{ Estado: parseInt(element.Estado.Id, 10) },
        }
       // console.info(dato);
        let head= this.head();
        return this.http.put(path + endpoint + '/' + dato.Id, dato, head);
    }
    postRegistro(endpoint: string, element: any) {
        const dato = {
            ...element,
            ...{ Rol: parseInt(element.Rol.Id, 10) },
            ...{ Enlace: parseInt(element.Enlace.Id, 10) },
            ...{ Estado: parseInt(element.Estado.Id, 10) },
            ...{ Fechacreacion: moment(new Date()).format('YYYY/MM/DD HH:mm:SS') },
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
