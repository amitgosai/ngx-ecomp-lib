import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxEcompLibComponent } from './ngx-ecomp-lib.component';

describe('NgxEcompLibComponent', () => {
  let component: NgxEcompLibComponent;
  let fixture: ComponentFixture<NgxEcompLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxEcompLibComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxEcompLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
