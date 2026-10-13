import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciowebFormComponent } from './serviciosweb-form.component';

describe('ServiciowebFormComponent', () => {
  let component: ServiciowebFormComponent;
  let fixture: ComponentFixture<ServiciowebFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiciowebFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiciowebFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
