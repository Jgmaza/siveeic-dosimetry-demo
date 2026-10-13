var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { NB_AUTH_OPTIONS } from '../../auth.options';
import { getDeepFromObject } from '../../helpers';
import { NbAuthService } from '../../services/auth.service';
var NbLoginComponent = /** @class */ (function () {
    function NbLoginComponent(service, options, cd, router) {
        if (options === void 0) { options = {}; }
        this.service = service;
        this.options = options;
        this.cd = cd;
        this.router = router;
        this.redirectDelay = 0;
        this.showMessages = {};
        this.strategy = '';
        this.errors = [];
        this.messages = [];
        this.user = {};
        this.submitted = false;
        this.socialLinks = [];
        this.rememberMe = false;
        this.redirectDelay = this.getConfigValue('forms.login.redirectDelay');
        this.showMessages = this.getConfigValue('forms.login.showMessages');
        this.strategy = this.getConfigValue('forms.login.strategy');
        this.socialLinks = this.getConfigValue('forms.login.socialLinks');
        this.rememberMe = this.getConfigValue('forms.login.rememberMe');
        var str = document.location.href; 
        this.url = str.split("#", 1); 
    }
    NbLoginComponent.prototype.login = function () {
        var _this = this;
        this.errors = [];
        this.messages = [];
        this.submitted = true;
        this.service.authenticate(this.strategy, this.user).subscribe(function (result) {
            _this.submitted = false;
            if (result.isSuccess()) {
                _this.messages = result.getMessages();
            }
            else {
                _this.errors = result.getErrors();
            }
            var redirect = result.getRedirect();
            if (redirect) {
                setTimeout(function () {
                    return _this.router.navigateByUrl(redirect);
                }, _this.redirectDelay);
            }
            _this.cd.detectChanges();
        });
    };
    NbLoginComponent.prototype.getConfigValue = function (key) {
        return getDeepFromObject(this.options, key, null);
    };
    NbLoginComponent = __decorate([
        Component({
            selector: 'nb-login',
            template: "<h1 id=\"title\" class=\"title\"><img [src]=\"'assets/images/logoSiveeic2.png'\" class=\"img-fluid\" alt=\"Sin imagen\"  width=\"350\" height=\"300\" >  </h1> <p class=\"sub-title\">Inicio de sesión.</p> <nb-alert *ngIf=\"showMessages.error && errors?.length && !submitted\" outline=\"danger\" role=\"alert\"> <p class=\"alert-title\"><b>Datos incorrectos!</b></p> <ul class=\"alert-message-list\"> <li *ngFor=\"let error of errors\" class=\"alert-message\">{{ error }}</li> </ul> </nb-alert> <nb-alert *ngIf=\"showMessages.success && messages?.length && !submitted\" outline=\"success\" role=\"alert\"> <p class=\"alert-title\"><b>Bienvenido!</b></p> <ul class=\"alert-message-list\"> <li *ngFor=\"let message of messages\" class=\"alert-message\">{{ message }}</li> </ul> </nb-alert> <form (ngSubmit)=\"login()\" #form=\"ngForm\" aria-labelledby=\"title\"> <div class=\"form-control-group\"> <label class=\"label\" for=\"input-email\">Usuario:</label> <input nbInput fullWidth [(ngModel)]=\"user.email\" #email=\"ngModel\" name=\"email\" id=\"input-email\" pattern=\".+@.+\..+\" placeholder=\"Usuario\" autofocus [status]=\"email.dirty ? 'success' :  ''\" [required]=\"getConfigValue('forms.validation.email.required')\" [attr.aria-invalid]=\" email.touched ? true : null\"> <ng-container *ngIf=\" email.touched\"> <p class=\"error-message\" *ngIf=\"email.errors?.required\"> El usuario es requerido</p> <!--p class=\"error-message\" *ngIf=\"email.errors?.pattern\"> Debe ingresar un correo valido! </p --> </ng-container> </div> <div class=\"form-control-group\"> <label class=\"label\" for=\"input-password\">Contraseña:</label> <input nbInput fullWidth [(ngModel)]=\"user.password\" #password=\"ngModel\" name=\"password\" type=\"password\" id=\"input-password\" placeholder=\"Contraseña\" [status]=\"password.dirty ? (password.invalid  ? 'danger' : 'success') : ''\" [required]=\"getConfigValue('forms.validation.password.required')\" [minlength]=\"getConfigValue('forms.validation.password.minLength')\" [maxlength]=\"getConfigValue('forms.validation.password.maxLength')\" [attr.aria-invalid]=\"password.invalid && password.touched ? true : null\"> <ng-container *ngIf=\"password.invalid && password.touched \"> <p class=\"error-message\" *ngIf=\"password.errors?.required\"> Contraseña requerida! </p> <p class=\"error-message\" *ngIf=\"password.errors?.minlength || password.errors?.maxlength\"> La Contraseña debe contener de {{ getConfigValue('forms.validation.password.minLength') }} a {{ getConfigValue('forms.validation.password.maxLength') }} caracteres </p> </ng-container> </div> <div class=\"form-control-group accept-group\"> <!--nb-checkbox name=\"rememberMe\" [(ngModel)]=\"user.rememberMe\" *ngIf=\"rememberMe\">Remember me</nb-checkbox--> <a class=\"forgot-password\" href=\"{{ getConfigValue('this.url') }}#/count/solicitar?g3nc4n=eyJ1MWQiOiIwMDAwMDAiLCJ1NTNyIjoicmVzdGF1cmFyIiwiZjNjaDQiOiIwMS8wMS8zMDAwIn0\"><b>Olvido su Contraseña?</b></a> </div> <button nbButton fullWidth status=\"success\" [disabled]=\"submitted \" [class.btn-pulse]=\"submitted\"> Ingresar </button> </form> <section *ngIf=\"socialLinks && socialLinks.length > 0\" class=\"links\" aria-label=\"Social sign in\"> or enter with: <div class=\"socials\"> <ng-container *ngFor=\"let socialLink of socialLinks\"> <a *ngIf=\"socialLink.link\" [routerLink]=\"socialLink.link\" [attr.target]=\"socialLink.target\" [attr.class]=\"socialLink.icon\" [class.with-icon]=\"socialLink.icon\">{{ socialLink.title }}</a> <a *ngIf=\"socialLink.url\" [attr.href]=\"socialLink.url\" [attr.target]=\"socialLink.target\" [attr.class]=\"socialLink.icon\" [class.with-icon]=\"socialLink.icon\">{{ socialLink.title }}</a> </ng-container> </div> </section> <section class=\"another-action\" aria-label=\"Register\"></section> ",
            changeDetection: ChangeDetectionStrategy.OnPush,
        }),
        __param(1, Inject(NB_AUTH_OPTIONS)),
        __metadata("design:paramtypes", [NbAuthService, Object, ChangeDetectorRef,
            Router])
    ], NbLoginComponent);
    return NbLoginComponent;
}());
export { NbLoginComponent };
//# sourceMappingURL=login.component.js.map
