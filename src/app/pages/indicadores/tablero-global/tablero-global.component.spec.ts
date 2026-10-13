import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableroGlobalComponent } from './tablero-global.component';

describe('TableroGlobalComponent', () => {
  let component: TableroGlobalComponent;
  let fixture: ComponentFixture<TableroGlobalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableroGlobalComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableroGlobalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
