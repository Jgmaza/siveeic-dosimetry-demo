import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MedidoresFormComponent } from './medidores-form.component';

describe('MedidoresFormComponent', () => {
  let component: MedidoresFormComponent;
  let fixture: ComponentFixture<MedidoresFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MedidoresFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedidoresFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
