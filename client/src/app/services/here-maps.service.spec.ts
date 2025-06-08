import { TestBed } from '@angular/core/testing';

import { HereMapsService } from './here-maps.service';

describe('HereMapsService', () => {
  let service: HereMapsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HereMapsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
