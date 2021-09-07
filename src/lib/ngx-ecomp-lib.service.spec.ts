import { TestBed } from '@angular/core/testing';

import { NgxEcompLibService } from './ngx-ecomp-lib.service';

describe('NgxEcompLibService', () => {
  let service: NgxEcompLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxEcompLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
