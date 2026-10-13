import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MedidoresListComponent } from './medidores-list.component';

describe('MedidoresListComponent', () => {
  let component: MedidoresListComponent;
  let fixture: ComponentFixture<MedidoresListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MedidoresListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedidoresListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
