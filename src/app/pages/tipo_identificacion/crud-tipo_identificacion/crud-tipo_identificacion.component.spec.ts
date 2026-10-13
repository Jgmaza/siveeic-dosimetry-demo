/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CrudTipoIdentificacionComponent } from './crud-tipo_identificacion.component';

describe('CrudTipoIdentificacionComponent', () => {
  let component: CrudTipoIdentificacionComponent;
  let fixture: ComponentFixture<CrudTipoIdentificacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudTipoIdentificacionComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudTipoIdentificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
