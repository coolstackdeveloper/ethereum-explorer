import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { EthereumApiService } from './ethereum-api.service';
import { TransactionDto } from '../models/transaction';
import {
  mockTransaction,
  HttpRequestInterceptorMock,
} from './ethereum-api-mock-interceptor';

describe('EthereumApiService', () => {
  let service: EthereumApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpRequestInterceptorMock,
          multi: true,
        },
      ],
    });
    service = TestBed.inject(EthereumApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return block info for valid block number', (done: any) => {
    service
      .searchByBlockNumber(1234, 1)
      .subscribe((transactions: TransactionDto[]) => {
        expect(transactions.length).toBe(1);
        expect(transactions[0].blockHash).toBe(mockTransaction.blockHash);
        expect(transactions[0].blockNumber).toBe(mockTransaction.blockNumber);
        expect(transactions[0].from).toBe(mockTransaction.from);
        expect(transactions[0].to).toBe(mockTransaction.to);
        expect(transactions[0].gas).toBe(mockTransaction.gas);
        expect(transactions[0].value).toBe(mockTransaction.value);
        expect(transactions[0].hash).toBe(mockTransaction.hash);
        done();
      });
  });

  it('should return error for invalid block number', (done: any) => {
    service.searchByBlockNumber(4567, 1).subscribe(
      (_) => {},
      (error) => {
        expect(error.message).toBe('Failed');
        done();
      }
    );
  });

  it('should return block info for valid address', (done: any) => {
    service
      .searchByAddress(6789, 1)
      .subscribe((transactions: TransactionDto[]) => {
        expect(transactions.length).toBe(1);
        expect(transactions[0].blockHash).toBe(mockTransaction.blockHash);
        expect(transactions[0].blockNumber).toBe(mockTransaction.blockNumber);
        expect(transactions[0].from).toBe(mockTransaction.from);
        expect(transactions[0].to).toBe(mockTransaction.to);
        expect(transactions[0].gas).toBe(mockTransaction.gas);
        expect(transactions[0].value).toBe(mockTransaction.value);
        expect(transactions[0].hash).toBe(mockTransaction.hash);
        done();
      });
  });
});
