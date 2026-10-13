import { BehaviorSubject, Observable, observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../../environments/environment';
import { Md5 } from 'ts-md5/dist/md5';
import * as moment from 'moment';
//import { NbAuthService, NbAuthJWTToken } from '@nebular/auth';  //componente auth desde nebular
import { NbAuthService, NbAuthJWTToken } from './../../@theme/components/auth'; // componente logueo adaptado aplicacion



/*
const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
*/
const path = environment.USUARIOS_SERVICE;


@Injectable({
    providedIn: 'root',
})
export class UsuariosService {
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
              this.auth=token;
              //this.user = <any>token.getPayload().operador; // here we receive a payload from the token and assigns it to our `user` variable
              this.user= {"id":token.getPayload().id,"operador":token.getPayload().operador};
              this.userSubject.next(this.user);
            } else {
              //this.user.id = 0;
              this.user= {"id":0,"operador":0};
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
        return this.http.get(path + endpoint,head);
    }
    post(endpoint, element) {
        let head= this.head()  
        return this.http.post(path + endpoint, element,head);
    }
    put(endpoint, element) {
        let head= this.head()  
        return this.http.put(path + endpoint + '/' + element.Id, element,head);
    }
    delete(endpoint, element) {
        let head= this.head()  
        return this.http.delete(path + endpoint + '/' + element.Id,head);
    }
    getOptions(endpoint, filter = '') {
        let head= this.head()  
        return this.http.get(`${path}${endpoint}/${this.user}/${filter}`,head);
    }
    putUser(endpoint, element) {
        const user = {
            ...element,
            // ...{ Fechacreacion: moment(new Date()).format('DD/MM/YY HH:mm:SS') },
            ...{ Fechaexpira: moment(element.Fechaexpira).format('YYYY/MM/DD HH:mm:SS') },
            //...{ Fechaexpira: moment(element.Fechaexpira).format('DD/MM/YY HH:mm:SS') },
            ...{ Tipoidentificacion: element.Tipoidentificacion.Id },
            ...{ Tipousuario: element.Tipousuario.Id },
            ...{ Estadousuario: parseInt(element.Estadousuario.Id, 10) },
            ...typeof element.Coordinacionoperativa !== 'undefined' ? { Coordinacionoperativa: element.Coordinacionoperativa.Id  } :
            { Coordinacionoperativa: 0 },
            ...{ Clave: this.generateHash(element.Nroidentificacion) },
            ...{ Estadousuario: parseInt(element.Estadousuario.Id, 10) },

        }
        let head= this.head()  
        return this.http.put(path + endpoint + '/' + user.Id, user,head);
    }
    postUser(endpoint: string, element: any) {
        const user = {
            ...element,
            ...{ Estadousuario: parseInt(element.Estadousuario.Id, 10) },
            ...{ Fechacreacion: moment(new Date()).format('YYYY/MM/DD HH:mm:SS') },
            ...{ Fechaexpira: moment(element.Fechaexpira).format('YYYY/MM/DD HH:mm:SS') },
            //...{ Fechaexpira: moment(element.Fechaexpira).format('DD/MM/YY HH:mm:SS') },
            ...{ Tipoidentificacion: element.Tipoidentificacion.Id },
            ...{ Tipousuario: element.Tipousuario.Id },
            ...typeof element.Coordinacionoperativa !== 'undefined' ? { Coordinacionoperativa: element.Coordinacionoperativa.Id  } :
            { Coordinacionoperativa: 0 },
            ...{ Clave: this.generateHash(element.Nroidentificacion) },
        }
        //console.info(endpoint, user);
        let head= this.head()  
        return this.http.post(path + endpoint, user,head);
    }

    postValidar(endpoint: string, element: any) {
        const user = {
            ...element,
        }
        //console.info(endpoint, user);
        let head= this.head()  
        return this.http.post(path + endpoint, user,head);
    }

    restaurarPassword(Nroidentificacion: any, body: any ) {
        let head= this.head()  
        return this.http.put(`${path}recuperar/${Nroidentificacion}`, body,head);
    }

    private generateHash(text: any) {
        return Md5.hashStr(text + '');
    }
}
