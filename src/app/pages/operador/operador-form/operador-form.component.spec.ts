import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperadorFormComponent } from './operador-form.component';

describe('OperadorFormComponent', () => {
  let component: OperadorFormComponent;
  let fixture: ComponentFixture<OperadorFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperadorFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperadorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
