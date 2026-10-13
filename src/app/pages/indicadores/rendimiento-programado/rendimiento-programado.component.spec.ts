import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RendimientoProgramadoComponent } from './rendimiento-programado.component';

describe('RendimientoProgramadoComponent', () => {
  let component: RendimientoProgramadoComponent;
  let fixture: ComponentFixture<RendimientoProgramadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RendimientoProgramadoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RendimientoProgramadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
