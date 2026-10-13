import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DosimetriaUploadComponent } from './dosimetria-upload.component';

describe('DosimetriaFormComponent', () => {
  let component: DosimetriaUploadComponent;
  let fixture: ComponentFixture<DosimetriaUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DosimetriaUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DosimetriaUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
