import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OperadorListComponent } from './operador-list.component';

describe('OperadorListComponent', () => {
  let component: OperadorListComponent;
  let fixture: ComponentFixture<OperadorListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperadorListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperadorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
