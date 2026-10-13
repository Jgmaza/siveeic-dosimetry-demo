/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ListTipoEstadoComponent } from './list-tipo_estado.component';

describe('ListTipoEstadoComponent', () => {
  let component: ListTipoEstadoComponent;
  let fixture: ComponentFixture<ListTipoEstadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListTipoEstadoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListTipoEstadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
