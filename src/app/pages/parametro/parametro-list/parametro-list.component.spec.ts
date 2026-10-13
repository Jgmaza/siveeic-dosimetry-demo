import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ParametroListComponent } from './parametro-list.component';

describe('ParametroListComponent', () => {
  let component: ParametroListComponent;
  let fixture: ComponentFixture<ParametroListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParametroListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParametroListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
