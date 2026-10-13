import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableroedaFormComponent } from './tableroseda-form.component';

describe('TableroedaFormComponent', () => {
  let component: TableroedaFormComponent;
  let fixture: ComponentFixture<TableroedaFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableroedaFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableroedaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
