/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ListTipoIdentificacionComponent } from './list-tipo_identificacion.component';

describe('ListTipoIdentificacionComponent', () => {
  let component: ListTipoIdentificacionComponent;
  let fixture: ComponentFixture<ListTipoIdentificacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListTipoIdentificacionComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListTipoIdentificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
