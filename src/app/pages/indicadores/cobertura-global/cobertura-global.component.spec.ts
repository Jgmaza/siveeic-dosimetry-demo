import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoberturaGlobalComponent } from './cobertura-global.component';

describe('CoberturaGlobalComponent', () => {
  let component: CoberturaGlobalComponent;
  let fixture: ComponentFixture<CoberturaGlobalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoberturaGlobalComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoberturaGlobalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
