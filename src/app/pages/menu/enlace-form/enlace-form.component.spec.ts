import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnlaceFormComponent } from './enlace-form.component';

describe('EnlaceFormComponent', () => {
  let component: EnlaceFormComponent;
  let fixture: ComponentFixture<EnlaceFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnlaceFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnlaceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
