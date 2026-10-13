import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosruralFormComponent } from './usuarios-rural-form.component';

describe('UsuariosruralFormComponent', () => {
  let component: UsuariosruralFormComponent;
  let fixture: ComponentFixture<UsuariosruralFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsuariosruralFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuariosruralFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
