import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionedaFormComponent } from './versioneseda-form.component';

describe('VersionedaFormComponent', () => {
  let component: VersionedaFormComponent;
  let fixture: ComponentFixture<VersionedaFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VersionedaFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionedaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
