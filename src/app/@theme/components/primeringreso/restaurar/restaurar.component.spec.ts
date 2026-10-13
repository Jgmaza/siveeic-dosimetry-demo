import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NbRestaurarComponent } from './restaurar.component';

describe('NbRestaurarComponent', () => {
  let component: NbRestaurarComponent;
  let fixture: ComponentFixture<NbRestaurarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NbRestaurarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NbRestaurarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
