import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class LoaderService {
    private isLoading = new BehaviorSubject({});
    public isLoading$ = this.isLoading.asObservable();

    constructor() {
        this.hide();
    }
    public show() {
        this.isLoading.next(false);
    }
    public hide() {
        this.isLoading.next(false);
    }
}
