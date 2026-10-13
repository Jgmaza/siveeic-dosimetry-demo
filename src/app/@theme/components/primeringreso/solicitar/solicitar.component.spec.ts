import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NbSolicitarComponent } from './solicitar.component';

describe('NbSolicitarComponent', () => {
  let component: NbSolicitarComponent;
  let fixture: ComponentFixture<NbSolicitarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NbSolicitarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NbSolicitarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
