import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MenuItem } from './menu-item';
import { MENU_ITEMS } from './pages-menu';
import { NbAuthJWTToken, NbAuthService } from './../@theme/components/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-pages',
  template: `
    <ngx-sample-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-sample-layout>
  `,
})

export class PagesComponent implements OnInit {

  public menu = [];
  object: MenuItem;
  hijo: MenuItem;
  hijo2: MenuItem;
  rol: String;
  dataMenu: any;
  roles: any;
  loginSubscription: any;
  user: any;
  opciones: any;

  constructor(
    private translate: TranslateService,
    private authService: NbAuthService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.menu = MENU_ITEMS.map((item) => ({ ...item, children: item.children ? [...item.children] : undefined }));
    this.translateMenu();
    this.translate.onLangChange.subscribe((_event: LangChangeEvent) => {
      this.translateMenu();
    });

    this.loginSubscription = this.authService
      .onTokenChange()
      .subscribe((token: NbAuthJWTToken) => {
        if (token.isValid()) {
          this.user = <any>token.getPayload().role;
        } else {
          this.user = 1;
        }
      });

    if (this.router.url === '/pages' || this.router.url === '/pages/') {
      this.router.navigate(['/pages/dosimetria/reportes-dosimetria']);
    }
  }

  private translateMenu(): void {
    this.menu.forEach((menuItem: MenuItem) => {
      this.translateMenuTitle(menuItem);
    });
  }

  private translateMenuTitle(menuItem: MenuItem, prefix: string = ''): void {
    let key = '';
    try {
      key = (prefix !== '')
        ? PagesComponent.getMenuItemKey(menuItem, prefix)
        : PagesComponent.getMenuItemKey(menuItem);
    } catch (e) {
      return;
    }

    this.translate.get(key).subscribe((translation: string) => {
      if (translation && translation !== key) {
        menuItem.title = translation;
      }
    });
    if (menuItem.children != null) {
      menuItem.children.forEach((childMenuItem: MenuItem) => {
        this.translateMenuTitle(childMenuItem, PagesComponent.trimLastSelector(key));
      });
    }
  }

  private static getMenuItemKey(menuItem: MenuItem, prefix: string = 'MENU'): string {
    if (menuItem.key == null) {
      throw new Error('Key not found');
    }

    const key = menuItem.key.toLowerCase();
    if (menuItem.children != null) {
      return prefix + '.' + key + '.' + key;
    }
    return prefix + '.' + key;
  }

  private static trimLastSelector(key: string): string {
    const keyParts = key.split('.');
    keyParts.pop();
    return keyParts.join('.');
  }
}
