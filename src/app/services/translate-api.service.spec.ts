import { TestBed } from '@angular/core/testing';

import { TranslateApiService } from './translate-api.service';

describe('TranslateApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TranslateApiService = TestBed.get(TranslateApiService);
    expect(service).toBeTruthy();
  });
});
