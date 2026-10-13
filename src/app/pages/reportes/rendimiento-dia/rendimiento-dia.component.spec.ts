import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RendimientoDiaComponent } from './rendimiento-dia.component';

describe('RendimientoDiaComponent', () => {
  let component: RendimientoDiaComponent;
  let fixture: ComponentFixture<RendimientoDiaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RendimientoDiaComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RendimientoDiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
