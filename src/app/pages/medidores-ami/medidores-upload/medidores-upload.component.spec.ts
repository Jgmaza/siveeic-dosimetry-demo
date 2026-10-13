import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MedidoresUploadComponent } from './medidores-upload.component';

describe('MedidoresFormComponent', () => {
  let component: MedidoresUploadComponent;
  let fixture: ComponentFixture<MedidoresUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MedidoresUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedidoresUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
