import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ApireporteListComponent } from './apireportes-list.component';

describe('ApireporteListComponent', () => {
  let component: ApireporteListComponent;
  let fixture: ComponentFixture<ApireporteListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApireporteListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApireporteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
