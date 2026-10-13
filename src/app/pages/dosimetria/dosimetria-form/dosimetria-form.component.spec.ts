import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DosimetriaFormComponent } from './dosimetria-form.component';

describe('DosimetriaFormComponent', () => {
  let component: DosimetriaFormComponent;
  let fixture: ComponentFixture<DosimetriaFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DosimetriaFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DosimetriaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
