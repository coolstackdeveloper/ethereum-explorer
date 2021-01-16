import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { shareReplay } from 'rxjs/operators';
import { TransactionDto } from '../models/transaction';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EthereumApiService {
  constructor(private http: HttpClient) {}

  searchByAddress(address, pageNumber) {
    return this.http
      .get<TransactionDto[]>(
        `${environment.apiUrl}/addresses/${address}/transactions?pageNumber=${pageNumber}`
      )
      .pipe(shareReplay());
  }

  searchByBlockNumber(blockNumber, pageNumber) {
    return this.http
      .get<TransactionDto[]>(
        `${environment.apiUrl}/blocks/${blockNumber}/transactions?pageNumber=${pageNumber}`
      )
      .pipe(shareReplay());
  }

  getTransactionCountByBlockNumber(blockNumber) {
    return this.http
      .get<Number>(
        `${environment.apiUrl}/blocks/${blockNumber}/transactionCount`
      )
      .pipe(shareReplay());
  }
}
