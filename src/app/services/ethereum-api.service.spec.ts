import { TestBed } from '@angular/core/testing';

import { EthereumApiService } from './ethereum-api.service';

describe('EthereumApiService', () => {
  let service: EthereumApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EthereumApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
