import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompartomienergiaFormComponent } from './comparto-mienergia-form.component';

describe('CompartomienergiaFormComponent', () => {
  let component: CompartomienergiaFormComponent;
  let fixture: ComponentFixture<CompartomienergiaFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompartomienergiaFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompartomienergiaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
