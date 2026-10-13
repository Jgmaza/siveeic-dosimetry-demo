import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CompartomienergiaListComponent } from './comparto-mienergia-list.component';

describe('CompartomienergiaListComponent', () => {
  let component: CompartomienergiaListComponent;
  let fixture: ComponentFixture<CompartomienergiaListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompartomienergiaListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompartomienergiaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
