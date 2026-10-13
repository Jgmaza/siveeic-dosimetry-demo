import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApireporteFormComponent } from './apireportes-form.component';

describe('ApireporteFormComponent', () => {
  let component: ApireporteFormComponent;
  let fixture: ComponentFixture<ApireporteFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApireporteFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApireporteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
