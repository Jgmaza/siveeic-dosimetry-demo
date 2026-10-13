import { BehaviorSubject, Observable, observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../../../environments/environment';
import * as moment from 'moment';

const path = environment.REGISTROS_SERVICE;

@Injectable({
    providedIn: 'root',
})
export class RecuperarService {
    user: any;
    loginSubscription: any;
    auth:any;
    header:any;

    private userSubject = new BehaviorSubject({});
    user$ = this.userSubject.asObservable()

    constructor(private http: HttpClient) {
        
      }

    head(){
            let header= {headers:{'Content-Type': 'application/json', 'authorization':'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MCwidXN1YXJpbyI6InBvd2VyYmkiLCJyb2xlIjoiaW50ZWxsaWdlbmNlIiwiaWF0IjoxNTk0ODQ5NjMxfQ.UY3BLtqi5zdxpRFaT9XIsYvQIV4gPPXN6iO39AlymMY'}} 
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
            ...{ Estado: parseInt(element.Estado.Id, 10) },
        }
        // console.info(dato);
        let head= this.head();
        return this.http.put(path + endpoint + '/' + dato.Id, dato, head);
    }
    postRegistro(endpoint: string, element: any) {
        const dato = {
            ...element,

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
        return this.http.put(`${path}primeringreso/${Nroidentificacion}`, body,head);
    }    

}
