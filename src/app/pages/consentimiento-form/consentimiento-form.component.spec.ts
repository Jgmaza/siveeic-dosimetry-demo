import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentimientoFormComponent } from './consentimiento-form.component';

describe('ConsentimientoFormComponent', () => {
  let component: ConsentimientoFormComponent;
  let fixture: ComponentFixture<ConsentimientoFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsentimientoFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsentimientoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
