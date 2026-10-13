import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompartomienergiaUploadComponent } from './comparto-mienergia-upload.component';

describe('CompartomienergiaFormComponent', () => {
  let component: CompartomienergiaUploadComponent;
  let fixture: ComponentFixture<CompartomienergiaUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompartomienergiaUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompartomienergiaUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
