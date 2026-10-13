import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

/** Portfolio demo: no login wall. */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) {
    return true;
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }

}
