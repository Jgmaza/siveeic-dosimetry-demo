/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CrudTipoEstadoComponent } from './crud-tipo_estado.component';

describe('CrudTipoEstadoComponent', () => {
  let component: CrudTipoEstadoComponent;
  let fixture: ComponentFixture<CrudTipoEstadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudTipoEstadoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudTipoEstadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
