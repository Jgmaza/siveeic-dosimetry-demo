import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RendimientoConsolidadoComponent } from './rendimiento-consolidado.component';

describe('RendimientoConsolidadoComponent', () => {
  let component: RendimientoConsolidadoComponent;
  let fixture: ComponentFixture<RendimientoConsolidadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RendimientoConsolidadoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RendimientoConsolidadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
