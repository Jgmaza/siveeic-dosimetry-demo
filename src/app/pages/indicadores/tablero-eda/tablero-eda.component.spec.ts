import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableroEdaComponent } from './tablero-eda.component';

describe('TableroEdaComponent', () => {
  let component: TableroEdaComponent;
  let fixture: ComponentFixture<TableroEdaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableroEdaComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableroEdaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
