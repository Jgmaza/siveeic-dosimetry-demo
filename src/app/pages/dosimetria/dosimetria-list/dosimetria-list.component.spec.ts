import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DosimetriaListComponent } from './dosimetria-list.component';

describe('DosimetriaListComponent', () => {
  let component: DosimetriaListComponent;
  let fixture: ComponentFixture<DosimetriaListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DosimetriaListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DosimetriaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
