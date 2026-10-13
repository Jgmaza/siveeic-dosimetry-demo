import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosruralUploadComponent } from './usuarios-rural-upload.component';

describe('UsuariosruralFormComponent', () => {
  let component: UsuariosruralUploadComponent;
  let fixture: ComponentFixture<UsuariosruralUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsuariosruralUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuariosruralUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
